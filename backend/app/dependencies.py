from supabase import Client, create_client

from app.config import get_settings

settings = get_settings()
supabase: Client = create_client(
    settings.supabase_url, settings.supabase_secret_key
)


def get_supabase() -> Client:
    """Retrieve the Supabase client.

    Override this dependency during tests to use a mock client.
    """
    return supabase
