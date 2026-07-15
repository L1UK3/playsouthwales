import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

logger = logging.getLogger("__main__")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run the pokedata sync in the background
    from backend.app.services.pokedata_scraper import sync_pokedata

    async def run_periodic_sync():
        # Wait 1 second after startup
        await asyncio.sleep(1)
        while True:
            try:
                logger.info("Starting background pokedata sync...")
                res = await sync_pokedata()
                logger.info(f"Background pokedata sync completed: {res}")
            except Exception as e:
                logger.error(f"Error in background pokedata sync: {e}")

            try:
                logger.info("Starting background sets sync...")
                from app.services.sets_scraper import run_sets_sync

                res_sets = await run_sets_sync()
                logger.info(f"Background sets sync completed: {res_sets}")
            except Exception as e:
                logger.error(f"Error in background sets sync: {e}")

            # Run every hour
            await asyncio.sleep(3600)

    sync_task = asyncio.create_task(run_periodic_sync())
    yield
    sync_task.cancel()
    try:
        await sync_task
    except asyncio.CancelledError:
        logger.info("Background sync task cancelled.")


"""
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"Unhandled exception on {request.method} {request.url.path}: {exc}",
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={
            "code": "internal_error",
            "message": "An unexpected server error occurred.",
        },
    )
"""
