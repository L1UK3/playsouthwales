import json
import logging
import os
import re
from datetime import datetime, timedelta

import httpx

logger = logging.getLogger(__name__)

# Path to the sets JSON data file
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.join(CURRENT_DIR, "..")
SETS_PATH = os.path.join(BASE_DIR, "data", "sets.json")


def clean_name(name_text: str) -> str:
    """Clean expansion names by stripping wiki TCG templates.

    Example: converts '{{tcg|Prismatic Fates}}' to 'Prismatic Fates'.
    """
    name_text = name_text.strip()
    match = re.match(r"\{\{[Tt][Cc][Gg]\|([^|]+)(?:\|([^}]+))?\}\}", name_text)
    if match:
        name = match.group(1)
        return name.strip()
    return name_text


def parse_cell_content(cell: str) -> str:
    """Parse a wikitext table cell to extract its raw text content.

    Identify the last pipe '|' character outside of links or templates.
    """
    cell = cell.strip()
    # Find the last '|' that is not inside [[...]] or {{...}}
    link_cnt = 0
    tpl_cnt = 0
    split_idx = -1
    for idx, char in enumerate(cell):
        if char == "|" and link_cnt == 0 and tpl_cnt == 0:
            split_idx = idx
        elif char == "[":
            if idx + 1 < len(cell) and cell[idx + 1] == "[":
                link_cnt += 1
        elif char == "]":
            if idx + 1 < len(cell) and cell[idx + 1] == "]":
                link_cnt -= 1
        elif char == "{":
            if idx + 1 < len(cell) and cell[idx + 1] == "{":
                tpl_cnt += 1
        elif char == "}":
            if idx + 1 < len(cell) and cell[idx + 1] == "}":
                tpl_cnt -= 1

    if split_idx != -1:
        return cell[split_idx + 1 :].strip()
    return cell


def parse_wikitext(content: str) -> list[dict]:
    """Parse Bulbapedia wikitext to extract expansion codes, names, and release dates."""
    # Find all table blocks in wikitext
    table_blocks = re.findall(r"\{\|.*?(?:\n\|\})", content, re.DOTALL)

    parsed_sets = []

    for block in table_blocks:
        if "Name of Expansion" not in block:
            continue

        rows = []
        current_row = []
        for line in block.splitlines():
            line = line.strip()
            if not line:
                continue
            if line.startswith("|-"):
                if current_row:
                    rows.append(current_row)
                    current_row = []
            elif line.startswith("|") and not line.startswith("|}"):
                cell_data = line[1:].strip()
                # Split by || if any, respecting brackets
                subcells = []
                curr = []
                link_cnt = 0
                tpl_cnt = 0
                i = 0
                while i < len(cell_data):
                    char = cell_data[i]
                    if (
                        char == "|"
                        and i + 1 < len(cell_data)
                        and cell_data[i + 1] == "|"
                        and link_cnt == 0
                        and tpl_cnt == 0
                    ):
                        subcells.append("".join(curr).strip())
                        curr = []
                        i += 2
                        continue
                    curr.append(char)
                    if (
                        char == "["
                        and i + 1 < len(cell_data)
                        and cell_data[i + 1] == "["
                    ):
                        link_cnt += 1
                    elif (
                        char == "]"
                        and i + 1 < len(cell_data)
                        and cell_data[i + 1] == "]"
                    ):
                        link_cnt -= 1
                    elif (
                        char == "{"
                        and i + 1 < len(cell_data)
                        and cell_data[i + 1] == "{"
                    ):
                        tpl_cnt += 1
                    elif (
                        char == "}"
                        and i + 1 < len(cell_data)
                        and cell_data[i + 1] == "}"
                    ):
                        tpl_cnt -= 1
                    i += 1
                if curr:
                    subcells.append("".join(curr).strip())

                for sc in subcells:
                    current_row.append(parse_cell_content(sc))

        if current_row:
            rows.append(current_row)

        # Process rows
        for row in rows:
            if len(row) >= 8:
                set_no = row[0].strip()
                name_cell = row[3].strip()
                release_date_cell = row[6].strip()

                # Check if set_no fits TCG expansions style (e.g. SV1, SV9, ME1, ME5, 30th, etc.)
                if not re.match(
                    r"^(SV\d+(\.\d+)?|ME\d+(\.\d+)?|\d+th|\d+)$", set_no
                ):
                    continue

                name = clean_name(name_cell)

                # Parse release date
                release_date_str = re.sub(
                    r"<[^>]+>", "", release_date_cell
                ).strip()
                release_date_str = re.sub(
                    r"<!--.*?-->", "", release_date_str
                ).strip()

                try:
                    release_date = datetime.strptime(
                        release_date_str, "%B %d, %Y"
                    )
                    release_date_iso = release_date.strftime("%Y-%m-%d")
                    legal_date = release_date + timedelta(days=14)
                    legal_date_iso = legal_date.strftime("%Y-%m-%d")
                except ValueError:
                    release_date_iso = None
                    legal_date_iso = None

                if release_date_iso:
                    parsed_sets.append(
                        {
                            "code": set_no,
                            "name": name,
                            "releaseDate": release_date_iso,
                            "legalDate": legal_date_iso,
                            "format": "Standard",
                        }
                    )

    return parsed_sets


async def run_sets_sync() -> dict:
    """Scrape upcoming and current set data from Bulbapedia, and calculate standard legality.

    Update backend/app/data/sets.json with sets released starting from SV9 (2025-03-28) onwards.
    """
    params = {
        "action": "query",
        "prop": "revisions",
        "titles": "List of Trading Card Game expansions",
        "rvslots": "*",
        "rvprop": "content",
        "format": "json",
    }
    url = "https://bulbapedia.bulbagarden.net/w/api.php"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

    try:
        logger.info("Fetching TCG set expansions from Bulbapedia...")
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url, params=params, headers=headers, timeout=15.0
            )
            response.raise_for_status()
            data = response.json()

        pages = data.get("query", {}).get("pages", {})
        wikitext = ""
        for page_data in pages.items():
            revisions = page_data.get("revisions", [])
            if revisions:
                wikitext = (
                    revisions[0].get("slots", {}).get("main", {}).get("*", "")
                )
                break

        if not wikitext:
            logger.error(
                "Failed to retrieve wikitext from Bulbapedia response."
            )
            return {"success": False, "error": "Empty page content"}

        all_sets = parse_wikitext(wikitext)

        # Filter sets to keep only those SV9 (2025-03-28) and newer
        # This keeps the sets file focused on current/upcoming Standard legality tracking.
        cutoff_date = "2025-03-28"
        filtered_sets = [s for s in all_sets if s["releaseDate"] >= cutoff_date]

        # Sort by release date descending
        filtered_sets.sort(key=lambda s: s["releaseDate"], reverse=True)

        if not filtered_sets:
            logger.warning("No sets parsed matching cutoff criteria.")
            return {"success": False, "error": "No sets matched filters"}

        # Write to sets.json
        os.makedirs(os.path.dirname(SETS_PATH), exist_ok=True)
        with open(SETS_PATH, "w", encoding="utf-8") as f:
            json.dump(filtered_sets, f, indent=4)

        logger.info(
            f"Successfully scraped and synced {len(filtered_sets)} sets to sets.json"
        )
        return {"success": True, "sets_synced": len(filtered_sets)}

    except Exception as e:
        logger.error(f"Failed to sync upcoming sets: {e}")
        return {"success": False, "error": str(e)}
