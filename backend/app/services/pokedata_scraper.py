import logging
from typing import Any

import httpx
from pydantic import BaseModel, Field

from app.dependencies import supabase

logger = logging.getLogger(__name__)


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


async def fetch_pokedata_events(url: str) -> list[dict[str, Any]]:
    import asyncio

    max_retries = 3
    retry_delay = 2.0

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
                        "Error fetching from pokedata URL %s after %d attempts: %r",
                        url,
                        max_retries,
                        e,
                    )
        return []


def clean_text(text: str) -> str:
    if not text:
        return ""

    text = text.replace("Pok\ufffdmon", "Pok\xe9mon")
    text = text.replace("Pok\u01e3mon", "Pok\xe9mon")
    text = text.replace("Pok\u01f8mon", "Pok\xe9mon")
    text = text.replace("\ufffd", "\xa3")
    return text


async def sync_pokedata() -> dict[str, Any]:
    urls = [
        "https://pokedata.ovh/events/api/_tcg/cups/challenges/pre/_latitude/51.7576404113981/_longitude/-3.5224914550781254/_radius/50/_unit/km",
        "https://pokedata.ovh/events/api/_vg/cups/challenges/_latitude/51.7576404113981/_longitude/-3.5224914550781254/_radius/50/_unit/km",
        "https://pokedata.ovh/events/api/_go/cups/challenges/_latitude/51.7576404113981/_longitude/-3.5224914550781254/_radius/50/_unit/km",
    ]

    event_type_map = {
        "League Challenge": "CHALLENGE",
        "League Cup": "CUP",
        "Pre Release": "PRE-RELEASE",
    }

    all_raw_events = []
    for url in urls:
        raw_events = await fetch_pokedata_events(url)
        all_raw_events.extend(raw_events)

    if not all_raw_events:
        logger.warning("No events fetched from pokedata.ovh")
        return {"inserted": 0, "skipped_existing": 0, "skipped_no_league": 0}

    # Fetch active leagues from DB to check for match
    try:
        leagues_res = supabase.table("leagues").select("id").execute()
        existing_league_ids: set[int] = {row["id"] for row in leagues_res.data}
    except Exception as e:
        logger.error("Failed to fetch leagues for sync verification: %s", e)
        return {"error": f"Failed to fetch leagues: {e}"}

    # Fetch existing event IDs to avoid overwriting them
    try:
        events_res = supabase.table("events").select("id").execute()
        existing_event_ids: set[str] = {
            str(row["id"]) for row in events_res.data
        }
    except Exception as e:
        logger.error("Failed to fetch existing events: %s", e)
        return {"error": f"Failed to fetch existing events: {e}"}

    inserted_count = 0
    skipped_existing_count = 0
    skipped_no_league_count = 0

    events_to_insert = []

    # Process and map each raw event
    for raw in all_raw_events:
        try:
            pokedata_event = PokedataEvent.model_validate(raw)
        except Exception as err:
            logger.warning("Validation error parsing pokedata event: %s", err)
            continue

        guid = pokedata_event.guid

        # Rule: If a guid has been fetched before, don't update its data
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

        # Rule: Only insert if the league exists in our DB
        if league_id not in existing_league_ids:
            skipped_no_league_count += 1
            continue

        ticket_link = pokedata_event.third_party_registration_website or None

        name = clean_text(pokedata_event.name)
        entry_fee = (
            clean_text(pokedata_event.cost) if pokedata_event.cost else None
        )

        game_map = {"tcg": "TCG", "vgc": "VGC", "go": "GO"}
        game = game_map.get(pokedata_event.product.lower(), "TCG")

        event_dict = {
            "id": guid,
            "name": name,
            "date": pokedata_event.date,
            "startTime": pokedata_event.time,
            "leagueId": league_id,
            "ticketLink": ticket_link,
            "eventType": event_type_map.get(
                pokedata_event.type.strip(), pokedata_event.type
            ),
            "game": game,
            "description": None,
            "entryFee": entry_fee,
            "excludedDates": None,
        }

        events_to_insert.append(event_dict)
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
