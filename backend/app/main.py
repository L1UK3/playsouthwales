from fastapi import FastAPI
from supabase import create_client, Client
import os
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()

supabaseUrl = os.environ.get("SUPABASE_URL")
supabaseKey = os.environ.get("SUPABASE_SECRET_KEY")

supabase: Client = create_client(
    supabaseUrl, 
    supabaseKey
)


app = FastAPI(
    title="play south wales API",
    description="API for managing events and leagues for Play South South Wales",
    version="1.0.0",
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=5000, reload=True)
