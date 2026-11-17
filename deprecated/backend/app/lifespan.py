import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown lifespan routines."""
    from app.config import get_settings
    from app.scheduler import BackgroundScheduler

    settings = get_settings()
    discord_enabled = bool(
        settings.discord_bot_token and settings.discord_channel_id
    )
    if not discord_enabled:
        logger.info("Discord is not configured; skipping event digests.")
    scheduler = BackgroundScheduler(discord_enabled=discord_enabled)
    try:
        await scheduler.start()
        yield
    finally:
        await scheduler.stop()
