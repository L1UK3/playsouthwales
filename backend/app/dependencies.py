from supabase import Client, create_client

from app.config import get_settings

settings = get_settings()
supabase: Client = create_client(
    settings.supabase_url, settings.supabase_secret_key
)


def get_supabase() -> Client:
    """
    FastAPI dependency that returns the Supabase client.
    Can be overridden in tests.
    """
    return supabase
