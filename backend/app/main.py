import logging
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import public, protected

logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(
    title="play south wales API",
    description="API for managing events and leagues for Play South South Wales",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://localhost:5173", "https://playsouthwales.uk", "https://www.playsouthwales.uk"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(public.router)
app.include_router(protected.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=5000, reload=True)
