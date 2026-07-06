import os
import sys

# Add project root to sys.path to support running directly as a script
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

import logging
import httpx
from typing import List, Dict, Any, Set
from pydantic import BaseModel, Field
from app.main import supabase

logger = logging.getLogger("uvicorn.error")

# Pydantic schema for raw Pokedata event (helps with validation and parsing)
class PokedataEvent(BaseModel):
    guid: str
    name: str
    date: str
    time: str = Field(alias="time")
    league: str
    type: str
    product: str = "tcg"
    shop: str
    street_address: str
    city: str
    state: str
    pokemon_url: str
    cost: str = ""
    event_website: str = Field(default="", alias="Event_website")
    third_party_registration_website: str = Field(default="", alias="Third_party_registration_website")

async def fetch_pokedata_events(url: str) -> List[Dict[str, Any]]:
    import asyncio
    max_retries = 3
    retry_delay = 2.0
    
    async with httpx.AsyncClient() as client:
        for attempt in range(1, max_retries + 1):
            try:
                logger.info(f"Fetching pokedata from {url} (attempt {attempt}/{max_retries})")
                response = await client.get(url, timeout=15.0)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                logger.warning(f"Attempt {attempt}/{max_retries} failed for {url}: {repr(e)}")
                if attempt < max_retries:
                    await asyncio.sleep(retry_delay)
                else:
                    logger.error(f"Error fetching from pokedata URL {url} after {max_retries} attempts: {repr(e)}")
        return []

def clean_text(text: str) -> str:
    if not text:
        return ""
    # Fix the common encoding issue in pokedata (e.g. PokǸmon -> Pokémon)
    text = text.replace("PokǸmon", "Pokémon")
    text = text.replace("Pok\u01e3mon", "Pokémon")
    text = text.replace("Pok\u01f8mon", "Pokémon")
    # Replace the replacement character  (commonly uffd) with £
    text = text.replace("\ufffd", "£")
    text = text.replace("", "£")
    return text

async def sync_pokedata() -> Dict[str, Any]:
    urls = [
        "https://pokedata.ovh/events/api/_tcg/cups/challenges/pre/_latitude/51.7576404113981/_longitude/-3.5224914550781254/_radius/50/_unit/km",
        "https://pokedata.ovh/events/api/_vg/cups/challenges/_latitude/51.7576404113981/_longitude/-3.5224914550781254/_radius/50/_unit/km",
        "https://pokedata.ovh/events/api/_go/cups/challenges/_latitude/51.7576404113981/_longitude/-3.5224914550781254/_radius/50/_unit/km"
    ]
    
    all_raw_events = []
    for url in urls:
        raw_events = await fetch_pokedata_events(url)
        all_raw_events.extend(raw_events)
        
    if not all_raw_events:
        logger.warning("No events fetched from pokedata.ovh")
        return {"inserted": 0, "skipped_existing": 0, "skipped_no_league": 0}

    # Fetch active leagues from DB to check for match
    try:
        leagues_res = supabase.table('leagues').select('id').execute()
        existing_league_ids: Set[int] = {row['id'] for row in leagues_res.data}
    except Exception as e:
        logger.error(f"Failed to fetch leagues for sync verification: {e}")
        return {"error": f"Failed to fetch leagues: {e}"}

    # Fetch existing event IDs to avoid overwriting them
    try:
        events_res = supabase.table('events').select('id').execute()
        existing_event_ids: Set[str] = {str(row['id']) for row in events_res.data}
    except Exception as e:
        logger.error(f"Failed to fetch existing events: {e}")
        return {"error": f"Failed to fetch existing events: {e}"}

    inserted_count = 0
    skipped_existing_count = 0
    skipped_no_league_count = 0
    
    events_to_insert = []
    
    # Process and map each raw event
    for raw in all_raw_events:
        try:
            # Parse using Pydantic for validation
            pokedata_event = PokedataEvent.model_validate(raw)
        except Exception as err:
            logger.warning(f"Validation error parsing pokedata event: {err}")
            continue
            
        guid = pokedata_event.guid
        
        # Rule: If a guid has been fetched before, don't update its data
        if guid in existing_event_ids:
            skipped_existing_count += 1
            continue
            
        # Parse league ID from pokedata "league" field
        try:
            league_id = int(pokedata_event.league)
        except ValueError:
            logger.warning(f"Invalid league ID: {pokedata_event.league} for event {guid}")
            skipped_no_league_count += 1
            continue
            
        # Rule: Only insert if the league exists in our DB
        if league_id not in existing_league_ids:
            skipped_no_league_count += 1
            continue

        # Choose the best ticket link
        ticket_link = (
            pokedata_event.third_party_registration_website or 
            pokedata_event.event_website or 
            pokedata_event.pokemon_url
        ) or None
        
        # Clean text descriptions
        name = clean_text(pokedata_event.name)
        entry_fee = clean_text(pokedata_event.cost) if pokedata_event.cost else None
        
        # Create description
        address_parts = [
            pokedata_event.street_address,
            pokedata_event.city,
            pokedata_event.state
        ]
        address = ", ".join([p for p in address_parts if p and p != "None"])
        description = clean_text(
            f"Official Play! Pokémon event hosted at {pokedata_event.shop}.\n"
            f"Location: {address}\n"
            f"More info: {pokedata_event.pokemon_url}"
        )
        
        # Map product to game type
        game_map = {
            "tcg": "TCG",
            "vgc": "VGC",
            "go": "GO"
        }
        game = game_map.get(pokedata_event.product.lower(), "TCG")
        
        event_dict = {
            "id": guid,
            "name": name,
            "date": pokedata_event.date,
            "startTime": pokedata_event.time,
            "leagueId": league_id,
            "ticketLink": ticket_link,
            "eventType": pokedata_event.type,
            "game": game,
            "description": description,
            "entryFee": entry_fee,
            "excludedDates": None
        }
        
        events_to_insert.append(event_dict)
        # Avoid duplicate guids within the same batch (if pokedata has duplicates)
        existing_event_ids.add(guid)

    if events_to_insert:
        try:
            # Batch insert new events in chunks of 50
            chunk_size = 50
            for i in range(0, len(events_to_insert), chunk_size):
                chunk = events_to_insert[i:i + chunk_size]
                supabase.table('events').insert(chunk).execute()
                inserted_count += len(chunk)
        except Exception as e:
            logger.error(f"Failed to batch insert events: {e}")
            return {"error": f"Database insert failed: {e}", "inserted": inserted_count}

    if skipped_no_league_count > 0:
        logger.warning(
            f"Pokedata sync: Skipped {skipped_no_league_count} events because their official Pokemon League IDs "
            "do not exist in the leagues database table. Please update the League ID in the Admin dashboard "
            "to match the official Pokemon League ID to enable syncing for that store."
        )
    
    return {
        "inserted": inserted_count,
        "skipped_existing": skipped_existing_count,
        "skipped_no_league": skipped_no_league_count
    }


if __name__ == "__main__":
    import asyncio
    import sys
    import os
    
    # Add project root to sys.path
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
        
    from dotenv import load_dotenv
    load_dotenv(os.path.join(project_root, ".env"))

    async def run():
        # Setup logging to stdout
        logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
        print("Starting pokedata sync...")
        res = await sync_pokedata()
        print("Sync results:", res)

    asyncio.run(run())
