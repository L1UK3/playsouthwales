import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown lifespan routines."""
    from app.scheduler import BackgroundScheduler

    scheduler = BackgroundScheduler()
    await scheduler.start()
    yield
    await scheduler.stop()
