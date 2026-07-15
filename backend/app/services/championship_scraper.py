import logging

import httpx
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class ChampionshipEvent(BaseModel):
    eventName_s: str
    previewImage_s: str
    previewImageAltText_s: str
    uRL_s: str
    displayDateRange_s: str
    isStreaming_b: str
    cardLinkTarget_s: str
    type_s: str
    region_s: str
    year_s: str
    locale_s: str
    eventLocation_s: str


async def fetch_championship_data(url: str) -> list[dict[str, str]]:
    """
    Fetches championship data from an external api
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


async def sync_championship_data() -> dict:
    """
    Map ChampionshipEvent data to the supabase database.
    """

    event_type_map = {}

    for url in [
        "https://api.pokemontcg.io/v2/events",
        "https://api.pokemontcg.io/v2/events?league=sm",
    ]:
        events = await fetch_championship_data(url)
        for event in events:
            championship_event = ChampionshipEvent(**event)
            # Here you would add logic to sync the championship_event to your database
            logger.info("Synced championship event: %s", championship_event)
