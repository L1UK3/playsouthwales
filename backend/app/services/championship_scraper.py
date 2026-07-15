import logging
import os
import re

import httpx
from pydantic import BaseModel, ValidationError

from app.dependencies import supabase

logger = logging.getLogger(__name__)

CHAMP_SERIES_URL = os.getenv("CHAMP_SERIES_URL")
CHAMP_SERIES_API_URL = os.getenv("CHAMP_SERIES_API_URL")


class ChampionshipEvent(BaseModel):
    eventName_s: str
    previewImage_s: str | None = None
    previewImageAltText_s: str | None = None
    uRL_s: str | None = None
    displayDateRange_s: str
    isStreaming_b: str | None = None
    cardLinkTarget_s: str | None = None
    type_s: str
    region_s: str | None = None
    year_s: str
    locale_s: str | None = None
    eventLocation_s: str | None = None


async def fetch_championship_data(url: str) -> list[dict] | dict:
    """
    Fetches championship data from an external API
    """
    import asyncio

    max_retries = 3
    retry_delay = 2.0

    async with httpx.AsyncClient() as client:
        for attempt in range(1, max_retries + 1):
            try:
                logger.info(
                    "Fetching championship data from %s (attempt %d/%d)",
                    url,
                    attempt,
                    max_retries,
                )
                response = await client.get(url, timeout=15.0)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                logger.warning(
                    "Attempt %d/%d failed for %s: %r",
                    attempt,
                    max_retries,
                    url,
                    e,
                )
                if attempt < max_retries:
                    await asyncio.sleep(retry_delay)
                else:
                    logger.error(
                        "Error fetching from championship URL %s after %d attempts: %r",
                        url,
                        max_retries,
                        e,
                    )
        return []


def get_calendar_date(date_range: str, season_year_str: str) -> str:
    """
    Parse the start date from displayDateRange_s and year_s to get YYYY-MM-DD.
    Example: 'Aug. 28-30', '2026' -> '2026-08-28'
             'Sept. 18-20', '2027' -> '2026-09-18' (2027 season starts in 2026)
    """
    # Replace different dash/hyphen characters with standard hyphen
    cleaned = (
        date_range.replace("\u2013", "-")
        .replace("\u2014", "-")
        .replace("\u2212", "-")
    )
    first_part = cleaned.split("-")[0].strip()
    parts = [p.strip() for p in first_part.split() if p.strip()]
    if len(parts) < 2:
        raise ValueError(f"Invalid date range format: {date_range}")

    month_str = parts[0].lower().rstrip(".")
    day_str = parts[1]

    # Keep only digits from the day string
    day_num = "".join(filter(str.isdigit, day_str))
    if not day_num:
        raise ValueError(f"No digits found for day in: {date_range}")

    month_map = {
        "jan": 1,
        "feb": 2,
        "mar": 3,
        "apr": 4,
        "may": 5,
        "jun": 6,
        "jul": 7,
        "aug": 8,
        "sep": 9,
        "oct": 10,
        "nov": 11,
        "dec": 12,
    }

    month_val = None
    for prefix, val in month_map.items():
        if month_str.startswith(prefix):
            month_val = val
            break

    if month_val is None:
        raise ValueError(f"Unknown month string: {month_str}")

    try:
        season_year = int(season_year_str)
    except ValueError:
        raise ValueError(f"Invalid season year: {season_year_str}")

    # The tournament season starts in September of the previous calendar year.
    # Therefore, events in Sept, Oct, Nov, and Dec of season Y happen in calendar year Y - 1.
    if month_val >= 9:
        calendar_year = season_year - 1
    else:
        calendar_year = season_year

    return f"{calendar_year}-{month_val:02d}-{int(day_num):02d}"


async def sync_championship_data() -> dict:
    """
    Map ChampionshipEvent data to the supabase database.
    """
    url = CHAMP_SERIES_API_URL

    try:
        raw_data = await fetch_championship_data(url)
    except Exception as e:
        logger.error(f"Failed to fetch championship data from API: {e}")
        return {"success": False, "error": f"Failed to fetch data: {e}"}

    # Handle dict vs list in API response
    if isinstance(raw_data, dict):
        items = raw_data.get("items", [])
    elif isinstance(raw_data, list):
        items = raw_data
    else:
        logger.error("Championship API returned unexpected data format")
        return {"success": False, "error": "Unexpected data format from API"}

    if not items:
        logger.warning("No events found in championship API response")
        return {"success": True, "inserted": 0, "skipped_existing": 0}

    try:
        # Retrieve or create the "Championship Series" league
        leagues_res = (
            supabase.table("leagues")
            .select("id")
            .eq("isChampionshipSeries", True)
            .execute()
        )

        if leagues_res.data:
            league_id = leagues_res.data[0]["id"]
        else:
            logger.info(
                "Championship league not found. Creating 'Championship Series'..."
            )
            new_league = {
                "name": "Championship Series",
                "logo": None,
                "website": CHAMP_SERIES_URL,
                "socialLink": None,
                "eventLink": None,
                "brandColor": "gold",  # Gold color for championship series
                "webLink": None,
                "location": "Various Locations",
                "latitude": None,
                "longitude": None,
                "accessibility": "Details available on official event pages.",
                "directions": "Check official venue information.",
                "isChampionshipSeries": True,
            }
            res = supabase.table("leagues").insert(new_league).execute()
            if not res.data:
                raise Exception("Failed to insert championship series league")
            league_id = res.data[0]["id"]
            logger.info(
                f"Created championship series league with ID {league_id}"
            )

        # Clean up all existing scraper-generated championship events to ensure stale or non-Europe events are removed.
        try:
            supabase.table("events").delete().like("id", "champ-%").execute()
            logger.info("Successfully cleaned up existing championship events.")
        except Exception as cleanup_err:
            logger.warning(
                f"Failed to clean up championship events: {cleanup_err}"
            )

        existing_event_ids = set()

    except Exception as e:
        logger.error(
            f"Database error during championship sync preparation: {e}"
        )
        return {"success": False, "error": f"Database error: {e}"}

    inserted_count = 0
    skipped_count = 0
    events_to_insert = []

    # 3. Process each raw event
    for raw in items:
        try:
            championship_event = ChampionshipEvent.model_validate(raw)
        except ValidationError as val_err:
            logger.warning(
                f"Validation failed for championship event: {val_err}. Raw data: {raw}"
            )
            continue

        # Only keep events in the Europe region, unless they are World or International Championships
        is_major_event = (
            championship_event.type_s
            and championship_event.type_s.lower() in ["world", "international"]
        )
        is_europe = (
            championship_event.region_s
            and championship_event.region_s.lower() == "europe"
        )
        if not (is_europe or is_major_event):
            continue

        try:
            # Calculate calendar start date
            calendar_date = get_calendar_date(
                championship_event.displayDateRange_s,
                championship_event.year_s,
            )
        except Exception as date_err:
            logger.warning(
                f"Failed to parse date range '{championship_event.displayDateRange_s}' for event: {championship_event.eventName_s}. Error: {date_err}"
            )
            continue

        # Generate slugified event name for id
        clean_name = championship_event.eventName_s.replace("’", "").replace(  # noqa: RUF001
            "'", ""
        )
        slug = re.sub(r"[^a-z0-9]+", "-", clean_name.lower()).strip("-")

        # Map event type
        raw_type = championship_event.type_s.lower()
        if raw_type == "world":
            event_type = "WORLDS"
        elif raw_type == "regional":
            event_type = "REGIONAL"
        elif raw_type == "special":
            event_type = "SPECIAL"
        elif raw_type == "international":
            event_type = "INTERNATIONAL"
        else:
            event_type = raw_type.upper()

        event_id = f"champ-{slug}"

        if event_id in existing_event_ids:
            skipped_count += 1
            continue

        location_str = championship_event.eventLocation_s or "TBD"
        description = (
            f"Official Championship Series {championship_event.type_s} event. "
            f"Location: {location_str}."
        )

        event_dict = {
            "id": event_id,
            "name": championship_event.eventName_s,
            "date": calendar_date,
            "startTime": None,
            "leagueId": league_id,
            "ticketLink": CHAMP_SERIES_URL + championship_event.uRL_s,
            "eventType": event_type,
            "game": "ALL",
            "description": description,
            "entryFee": None,
            "excludedDates": None,
        }

        events_to_insert.append(event_dict)
        existing_event_ids.add(event_id)
        inserted_count += 1

    # 4. Perform bulk insert
    if events_to_insert:
        try:
            chunk_size = 50
            for i in range(0, len(events_to_insert), chunk_size):
                chunk = events_to_insert[i : i + chunk_size]
                supabase.table("events").insert(chunk).execute()
            logger.info(
                f"Successfully inserted {len(events_to_insert)} championship events."
            )
        except Exception as e:
            logger.error(f"Failed to bulk insert championship events: {e}")
            return {"success": False, "error": f"Failed to bulk insert: {e}"}

    return {
        "success": True,
        "inserted": inserted_count,
        "skipped_existing": skipped_count,
    }
