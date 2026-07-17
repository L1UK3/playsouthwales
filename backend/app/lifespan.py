import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.scheduler import BackgroundScheduler

    scheduler = BackgroundScheduler()
    await scheduler.start()
    yield
    await scheduler.stop()
