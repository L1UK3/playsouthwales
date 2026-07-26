import json
import logging
import os
import re
from typing import Any

import requests
from bs4 import BeautifulSoup

URL = "https://www.pokemon-zone.com/champions/regulations/"

logger = logging.getLogger(__name__)
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.join(CURRENT_DIR, "..")
REGS_PATH = os.path.join(BASE_DIR, "data", "regs.json")
HTML_CACHE_PATH = os.path.join(BASE_DIR, "data", "pokemon_zone_regs.html")


def clean_text(text: str) -> str:
    """Clean text by normalizing whitespace and fixing encoding errors."""
    if not text:
        return ""
    cleaned = " ".join(text.split())
    # Fix Pokémon spelling issues
    cleaned = cleaned.replace("Pok\ufffdmon", "Pokémon")
    cleaned = cleaned.replace("Pok\u01e3mon", "Pokémon")
    cleaned = cleaned.replace("Pok\u01f8mon", "Pokémon")
    cleaned = cleaned.replace("Pokmon", "Pokémon")
    cleaned = cleaned.replace("PokǸmon", "Pokémon")
    # Clean the replacement char in date ranges
    cleaned = cleaned.replace("\ufffd", "–")  # noqa: RUF001
    return cleaned


def parse_date_str(date_str: str, year: str) -> str:
    """Parse a date string like 'April 8' or 'September 1' with a year, returning ISO format YYYY-MM-DD."""
    month_map = {
        "jan": 1,
        "january": 1,
        "feb": 2,
        "february": 2,
        "mar": 3,
        "march": 3,
        "apr": 4,
        "april": 4,
        "may": 5,
        "jun": 6,
        "june": 6,
        "jul": 7,
        "july": 7,
        "aug": 8,
        "august": 8,
        "sep": 9,
        "sept": 9,
        "september": 9,
        "oct": 10,
        "october": 10,
        "nov": 11,
        "november": 11,
        "dec": 12,
        "december": 12,
    }

    parts = [p.strip().lower() for p in date_str.split()]
    if len(parts) >= 2:
        month_name = parts[0].rstrip(".")
        day_str = "".join(filter(str.isdigit, parts[1]))

        month = month_map.get(month_name)
        if month and day_str:
            return f"{year}-{month:02d}-{int(day_str):02d}"

    raise ValueError(
        f"Could not parse date string: {date_str} with year {year}"
    )


def extract_dates_from_regulation(
    regulation_text: str, year: str
) -> tuple[str, str]:
    """Extract start and end date from a regulation text like 'Regulation M-A (April 8 ...)'."""
    match = re.search(r"\(([^)]+)\)", regulation_text)
    if not match:
        raise ValueError(f"No parentheses found in: {regulation_text}")

    range_str = match.group(1)
    # Remove extra info like 'in Pokémon Champions' or 'in VGC'
    range_str = re.sub(
        r"\s+in\s+[^-\u2013\u2014]+", "", range_str, flags=re.IGNORECASE
    )

    # Split by any dash character
    parts = re.split(r"[-–—]", range_str)  # noqa: RUF001
    if len(parts) != 2:
        raise ValueError(f"Could not split date range: {range_str}")

    start_date = parse_date_str(parts[0].strip(), year)
    end_date = parse_date_str(parts[1].strip(), year)
    return start_date, end_date


def parse_regs_html(html_content: str) -> list[dict[str, Any]]:
    """Parse VGC regulations page HTML and return a list of regulations with start and end dates."""
    soup = BeautifulSoup(html_content, "html.parser")
    body = soup.select_one(".article-detail__body")

    regulations = []

    if body:
        current_section = None
        current_year = None

        for child in body.children:
            if child.name in ["h2", "h3", "p"]:
                text = clean_text(child.get_text())
                if not text:
                    continue

                if child.name == "h2":
                    if "Seasons" in text:
                        current_section = "seasons"
                    else:
                        current_section = None

                elif child.name == "h3":
                    if current_section == "seasons":
                        # Match years like 2026, 2027
                        if re.match(r"^\d{4}$", text):
                            current_year = text

                elif child.name == "p":
                    if current_section == "seasons" and current_year:
                        # Find lines like "Regulation M-A (April 8 in Pokémon Champions - June 16)"
                        if text.startswith("Regulation"):
                            try:
                                # Extract the regulation name, e.g., "Regulation M-A"
                                name_match = re.match(
                                    r"^(Regulation\s+[A-Za-z0-9-]+)", text
                                )
                                name = (
                                    name_match.group(1) if name_match else text
                                )

                                start_date, end_date = (
                                    extract_dates_from_regulation(
                                        text, current_year
                                    )
                                )
                                regulations.append(
                                    {
                                        "name": name,
                                        "start_date": start_date,
                                        "end_date": end_date,
                                    }
                                )
                            except Exception as e:
                                logger.warning(
                                    f"Failed to parse regulation paragraph '{text}': {e}"
                                )

    return regulations


def fetch_vgc_regs() -> list[dict[str, Any]]:
    """Fetch VGC regulations from the official page or fallback to cached HTML."""
    html_content = ""
    try:
        logger.info(f"Attempting to fetch VGC regulations from {URL}")
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        }
        response = requests.get(URL, headers=headers, timeout=10)
        if response.status_code == 200:
            html_content = response.text
            try:
                with open(HTML_CACHE_PATH, "w", encoding="utf-8") as f:
                    f.write(html_content)
                logger.info(f"Updated HTML cache file at {HTML_CACHE_PATH}")
            except Exception as cache_err:
                logger.warning(
                    f"Could not update local HTML cache: {cache_err}"
                )
        else:
            logger.warning(
                f"Failed to fetch from {URL} (status code {response.status_code}). "
                "Attempting fallback to local cache."
            )
    except Exception as e:
        logger.warning(
            f"Error fetching from URL {URL}: {e}. Attempting fallback to local cache."
        )

    if not html_content:
        if os.path.exists(HTML_CACHE_PATH):
            logger.info(f"Loading cached HTML from {HTML_CACHE_PATH}")
            with open(HTML_CACHE_PATH, encoding="utf-8") as f:
                html_content = f.read()
        else:
            logger.error("No online data and no HTML cache found.")
            return []

    return parse_regs_html(html_content)


def save_vgc_regs(regs: list[dict[str, Any]], file_path: str) -> None:
    """Dump VGC regulations list to a JSON file."""
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(regs, f, ensure_ascii=False, indent=4)


def sync_vgc_regs() -> None:
    """Fetch the latest VGC regulations and save them to a JSON file."""
    regs = fetch_vgc_regs()
    if regs:
        save_vgc_regs(regs, REGS_PATH)
        logger.info(f"Successfully synced VGC regulations to {REGS_PATH}")
    else:
        logger.warning("No regulations found to sync.")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    sync_vgc_regs()
