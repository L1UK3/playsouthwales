import logging
from typing import Any

import httpx
from pydantic import BaseModel, Field

from app.config import get_settings
from app.dependencies import supabase

logger = logging.getLogger(__name__)

API_URL: str = "https://pokedata.ovh/events/apiv2/"
COORDS: dict[str, float] = {
    "latitude": 51.7576404113981,
    "longitude": -3.5224914550781254,
    "radius": 50,
    "unit": "km",
}
COORDS_TO_STRING: str = (
    f"_latitude/{COORDS['latitude']}/"
    + f"_longitude/{COORDS['longitude']}/"
    + f"_radius/{COORDS['radius']}/"
    + f"_unit/{COORDS['unit']}"
)
EVENT_TYPE_MAP: dict[str, str] = {
    "League Challenge": "CHALLENGE",
    "League Cup": "CUP",
    "Pre Release": "PRE-RELEASE",
}
GAME_MAP: dict[str, str] = {"tcg": "TCG", "vgc": "VGC", "go": "GO"}


class PokedataEvent(BaseModel):
    guid: str
    name: str
    date: str
    time: str = Field(alias="time")
    league: str
    type: str
    product: str = "tcg"
    shop: str | None = None
    street_address: str | None = None
    city: str | None = None
    state: str | None = None
    pokemon_url: str | None = None
    cost: str = ""
    event_website: str = Field(default="", alias="Event_website")
    third_party_registration_website: str = Field(
        default="", alias="Third_party_registration_website"
    )


async def fetch_pokedata_events(
    url: str, *, max_retries: int = 3, retry_delay: float = 2.0
) -> list[dict[str, Any]]:
    """Retrieve event data from the Pokédata API."""
    import asyncio

    async with httpx.AsyncClient() as client:
        for attempt in range(1, max_retries + 1):
            try:
                logger.info(
                    "Fetching pokedata from %s (attempt %d/%d)",
                    url,
                    attempt,
                    max_retries,
                )
                response = await client.get(url, timeout=15.0)
                response.raise_for_status()
                return response.json()
            except Exception as exc:
                logger.warning(
                    "Attempt %d/%d failed for %s: %r",
                    attempt,
                    max_retries,
                    url,
                    exc,
                )
                if attempt == max_retries:
                    logger.error(
                        "Error fetching from pokedata URL %s after %d attempts: %r",
                        url,
                        max_retries,
                        exc,
                    )
                    break
                await asyncio.sleep(retry_delay)

    return []


def clean_text(text: str | None, max_length: int | None = None) -> str:
    if not text:
        return ""

    replacements = {
        "Pok\ufffdmon": "Pok\xe9mon",
        "Pok\u01e3mon": "Pok\xe9mon",
        "Pok\u01f8mon": "Pok\xe9mon",
        "\ufffd": "\xa3",
    }
    for bad_value, clean_value in replacements.items():
        text = text.replace(bad_value, clean_value)

    text = " ".join(text.split()).strip()

    if max_length and len(text) > max_length:
        text = text[:max_length].rstrip()

    return text


def _load_db_ids(table_name: str, id_field: str = "id") -> set[str]:
    rows = supabase.table(table_name).select(id_field).execute().data or []
    return {str(row[id_field]) for row in rows}


def _build_event_record(event: PokedataEvent, league_id: int) -> dict[str, Any]:
    ticket_link = (
        event.third_party_registration_website.strip()
        if event.third_party_registration_website
        else None
    )
    raw_event_type = event.type.strip() if event.type else ""

    return {
        "id": event.guid,
        "name": clean_text(event.name),
        "date": clean_text(event.date, max_length=50),
        "startTime": clean_text(event.time, max_length=50)
        if event.time
        else None,
        "leagueId": league_id,
        "ticketLink": ticket_link,
        "eventType": clean_text(
            EVENT_TYPE_MAP.get(raw_event_type, raw_event_type), max_length=50
        ),
        "game": GAME_MAP.get(event.product.lower(), "TCG")[:20],
        "description": None,
        "entryFee": clean_text(event.cost, max_length=100)
        if event.cost
        else None,
        "excludedDates": None,
    }


async def sync_pokedata() -> dict[str, Any]:
    """Synchronize event data from Pokédata with the Supabase database."""
    urls = [
        f"{API_URL}_tcg/cups/challenges/pre{COORDS_TO_STRING}",
        f"{API_URL}_vg/cups/challenges{COORDS_TO_STRING}",
        f"{API_URL}_go/cups/challenges{COORDS_TO_STRING}",
    ]

    all_raw_events = []
    for url in urls:
        raw_events = await fetch_pokedata_events(url)
        all_raw_events.extend(raw_events)

    if not all_raw_events:
        logger.warning("No events fetched from pokedata.ovh")
        return {"inserted": 0, "skipped_existing": 0, "skipped_no_league": 0}

    try:
        existing_league_ids = {
            int(row_id) for row_id in _load_db_ids("leagues")
        }
    except Exception as exc:
        logger.error("Failed to fetch leagues for sync verification: %s", exc)
        return {"error": f"Failed to fetch leagues: {exc}"}

    try:
        existing_event_ids = _load_db_ids("events")
    except Exception as exc:
        logger.error("Failed to fetch existing events: %s", exc)
        return {"error": f"Failed to fetch existing events: {exc}"}

    inserted_count = 0
    skipped_existing_count = 0
    skipped_no_league_count = 0

    events_to_insert = []

    for raw in all_raw_events:
        try:
            pokedata_event = PokedataEvent.model_validate(raw)
        except Exception as err:
            logger.warning("Validation error parsing pokedata event: %s", err)
            continue

        guid = pokedata_event.guid

        if guid in existing_event_ids:
            skipped_existing_count += 1
            continue

        try:
            league_id = int(pokedata_event.league)
        except ValueError:
            logger.warning(
                "Invalid league ID: %s for event %s",
                pokedata_event.league,
                guid,
            )
            skipped_no_league_count += 1
            continue

        if league_id not in existing_league_ids:
            skipped_no_league_count += 1
            continue

        events_to_insert.append(_build_event_record(pokedata_event, league_id))
        existing_event_ids.add(guid)

    if events_to_insert:
        try:
            chunk_size = 50
            for i in range(0, len(events_to_insert), chunk_size):
                chunk = events_to_insert[i : i + chunk_size]
                supabase.table("events").insert(chunk).execute()
                inserted_count += len(chunk)
        except Exception as e:
            logger.error("Failed to batch insert events: %s", e)
            return {
                "error": f"Database insert failed: {e}",
                "inserted": inserted_count,
            }

    if skipped_no_league_count > 0:
        logger.warning(
            "Pokedata sync: Skipped %d events because their official "
            "League IDs do not exist in the leagues database "
            "table. Please update the League ID in the Admin dashboard "
            "to match the official League ID to enable "
            "syncing for that store.",
            skipped_no_league_count,
        )

    return {
        "inserted": inserted_count,
        "skipped_existing": skipped_existing_count,
        "skipped_no_league": skipped_no_league_count,
    }


async def get_cp(year: int = 2027) -> None:
    """Fetch Welsh player CP from Pokédata and update Supabase."""
    settings = get_settings()

    players = (
        supabase.table("welsh_players").select("name").execute().data or []
    )
    if not players:
        return

    payload = {
        "APIKEY": settings.pokedata_key,
        "players": [
            {
                "name": player["name"],
                "game": "tcg",
                "division": "master",
                "product": "tcg",
                "country": "GBR",
            }
            for player in players
        ],
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://pokedata.ovh/{year}/api/", json=payload, timeout=20.0
        )
        data = response.json()

    for item in data:
        try:
            supabase.table("welsh_players").update(
                {"cp": item.get("points")}
            ).eq("name", item["name"]).execute()
        except Exception as e:
            logger.error(
                "Failed to update CP for player %s: %s", item["name"], e
            )
