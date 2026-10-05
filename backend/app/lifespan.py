import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown lifespan routines."""
    # from app.integrations.discord_bot import DiscordBroadcaster
    from app.scheduler import BackgroundScheduler

    # broadcaster = DiscordBroadcaster()
    # await broadcaster.start()
    scheduler = BackgroundScheduler(broadcaster=None)
    try:
        await scheduler.start()
        yield
    finally:
        await scheduler.stop()
        # await broadcaster.stop()
