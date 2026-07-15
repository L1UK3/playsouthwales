import logging

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.lifespan import lifespan
from app.routers import protected, public

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()


def create_app() -> FastAPI:

    settings = get_settings()
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

    app.include_router(public.router)
    app.include_router(protected.router)

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

    return app
