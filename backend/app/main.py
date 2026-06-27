import logging
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from supabase import Client, create_client
from app.config import get_settings

logger = logging.getLogger(__name__)

load_dotenv()

settings = get_settings()

supabase: Client = create_client(settings.supabase_url, settings.supabase_secret_key)

from app.routers import public, protected

app = FastAPI(
    title="play south wales API",
    description="API for managing events and leagues for Play South South Wales",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
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
