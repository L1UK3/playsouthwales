import asyncio
import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from supabase import Client, create_client

from app.config import get_settings

logger = logging.getLogger("uvicorn.error")

load_dotenv()

settings = get_settings()

supabase: Client = create_client(settings.supabase_url, settings.supabase_secret_key)

from app.routers import protected, public


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run the pokedata sync in the background
    from app.services.pokedata_sync import sync_pokedata
    
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
                logger.info("Starting background top20 sync...")
                from app.services.top20_scraper import run_top20_sync
                res_top20 = await run_top20_sync()
                logger.info(f"Background top20 sync completed: {res_top20}")
            except Exception as e:
                logger.error(f"Error in background top20 sync: {e}")

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

app = FastAPI(
    title="play south wales API",
    lifespan=lifespan,
    description="API for managing events and leagues for Play South South Wales",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Access-Control-Allow-Origin",
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
    ],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "code": "internal_error",
            "message": "An unexpected server error occurred.",
            "detail": str(exc)
        }
    )

app.include_router(public.router)
app.include_router(protected.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=5000, reload=True)
