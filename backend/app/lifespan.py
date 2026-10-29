import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown lifespan routines."""
    from app.config import get_settings
    from app.integrations.discord_bot import DiscordBroadcaster
    from app.scheduler import BackgroundScheduler

    broadcaster = DiscordBroadcaster.from_settings(get_settings())
    if broadcaster is None:
        logger.info("Discord is not configured; skipping event digests.")
    scheduler = BackgroundScheduler(broadcaster=broadcaster)
    try:
        await scheduler.start()
        yield
    finally:
        await scheduler.stop()
