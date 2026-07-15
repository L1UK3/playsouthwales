import json
import logging
import os
import re

import httpx
from pydantic import BaseModel

logger = logging.getLogger(__name__)

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(os.path.dirname(CURRENT_DIR), "data", "championships.json")

MONTH_MAP = {
    "jan": 1,
    "feb": 2,
    "mar": 3,
    "apr": 4,
    "may": 5,
    "june": 6,
    "jun": 6,
    "july": 7,
    "jul": 7,
    "aug": 8,
    "sept": 9,
    "sep": 9,
    "oct": 10,
    "nov": 11,
    "dec": 12,
}


class RawChampionshipEvent(BaseModel):
    eventName_s: str
    previewImage_s: str | None = None
    previewImageAltText_s: str | None = None
    uRL_s: str
    displayDateRange_s: str
    isStreaming_b: str | bool
    cardLinkTarget_s: str
    type_s: str
    region_s: str
    year_s: str
    locale_s: str
    eventLocation_s: str


class ChampionshipsPayload(BaseModel):
    itemsFound: int
    items: list[RawChampionshipEvent]


def parse_date_range(display_range: str, year: str) -> str | None:
    first_part = re.split(r"[-\u2013\u2014]", display_range)[0].strip()
    match = re.match(r"([A-Za-z]+)\.?\s*(\d+)", first_part)
    if not match:
        return None
    month_str, day_str = match.groups()
    month_lower = month_str.lower()
    month = None
    for k, v in MONTH_MAP.items():
        if month_lower.startswith(k):
            month = v
            break
    if month is None:
        return None
    day = int(day_str)
    return f"{year}-{month:02d}-{day:02d}"


async def scrape_championships_events() -> dict:
    """
    Fetches upcoming championships events from the official Pokemon API,
    validates the structure, parses the dates, and formats them in standard
    event schema before caching locally as a JSON file.
    """
    url = "https://championships.pokemon.com/api/events.json?locale=en-us&status=upcoming"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

    try:
        logger.info("Fetching upcoming championships events from %s", url)
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, timeout=15.0)
            response.raise_for_status()
            raw_data = response.json()

        payload = ChampionshipsPayload.model_validate(raw_data)

        formatted_events = []
        for item in payload.items:
            date_str = parse_date_range(item.displayDateRange_s, item.year_s)
            if not date_str:
                logger.warning(
                    "Could not parse date range: %s", item.displayDateRange_s
                )
                continue

            raw_type = item.type_s.lower()
            if "world" in raw_type:
                event_type = "WORLDS"
            elif "international" in raw_type:
                event_type = "INTERNATIONAL"
            elif "regional" in raw_type:
                event_type = "REGIONAL"
            elif "special" in raw_type:
                event_type = "SPECIAL"
            else:
                event_type = "SPECIAL"

            desc = f"Official Pokemon {event_type.title()} event in {item.eventLocation_s}."
            is_streaming = (
                item.isStreaming_b == "true" or item.isStreaming_b is True
            )
            if is_streaming:
                desc += " (Live Stream available)"

            formatted_events.append(
                {
                    "id": f"championship-{item.eventName_s.lower().replace(' ', '-')}",
                    "name": item.eventName_s,
                    "date": date_str,
                    "startTime": "",
                    "leagueId": -1,
                    "ticketLink": item.uRL_s,
                    "eventType": event_type,
                    "game": "TCG",
                    "description": desc,
                    "entryFee": "",
                }
            )

        os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
        with open(DATA_PATH, "w", encoding="utf-8") as f:
            json.dump(formatted_events, f, indent=4)

        logger.info(
            "Successfully scraped and synced %d championships events",
            len(formatted_events),
        )
        return {"success": True, "count": len(formatted_events)}

    except Exception as e:
        logger.error("Failed to scrape championships events: %s", e)
        return {"success": False, "error": str(e)}


if __name__ == "__main__":
    import asyncio

    async def test():
        logging.basicConfig(level=logging.INFO)
        res = await scrape_championships_events()
        print("Scrape results:", res)

    asyncio.run(test())
