"""
Shared fixtures for the Play! South Wales backend test suite.

Mocks the Supabase client, Clerk auth, environment variables, and app lifespan
so tests run without any external dependencies.
"""

import os
from contextlib import asynccontextmanager
from unittest.mock import MagicMock, patch

import pytest

# ---------------------------------------------------------------------------
# 1. Inject fake env vars BEFORE any app code is imported.
#    Settings (pydantic-settings) reads env vars at import time via get_settings().
# ---------------------------------------------------------------------------
os.environ.setdefault("CLERK_SECRET_KEY", "sk_test_fake")
os.environ.setdefault("SUPABASE_URL", "https://fake.supabase.co")
os.environ.setdefault("SUPABASE_SECRET_KEY", "fake-supabase-key")


# ---------------------------------------------------------------------------
# 2. Patch create_client so the module-level call in main.py never hits the
#    network. This MUST happen before ``app.main`` is imported.
# ---------------------------------------------------------------------------
_mock_supabase = MagicMock(name="MockSupabaseClient")

_create_client_patcher = patch(
    "supabase.create_client",
    return_value=_mock_supabase,
)
_create_client_patcher.start()

# Also clear the lru_cache so get_settings() picks up our env vars
from app.config import get_settings  # noqa: E402

get_settings.cache_clear()

# Now we can safely import the FastAPI app
from app import create_app  # noqa: E402

app = create_app()


# ---------------------------------------------------------------------------
# 3. Replace the real lifespan with a no-op so the background sync task
#    never starts during tests.
# ---------------------------------------------------------------------------
@asynccontextmanager
async def _noop_lifespan(_app):
    yield


app.router.lifespan_context = _noop_lifespan


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture()
def mock_supabase():
    """Return the shared mock Supabase client and reset it between tests."""
    _mock_supabase.reset_mock()
    return _mock_supabase


def _chain_mock(data=None):
    """Build a mock that supports Supabase's chained query interface.

    Example real call:
        supabase.table('events').select('*').eq('leagueId', 1).like('date', '2026-07%').execute()

    Every intermediate method returns the same mock, and ``.execute()`` returns
    an object with a ``.data`` attribute.
    """
    chain = MagicMock()
    result = MagicMock()
    result.data = data if data is not None else []

    # Each chainable method returns the same chain mock
    for method in ("select", "eq", "like", "insert", "update", "delete", "neq"):
        getattr(chain, method).return_value = chain

    chain.execute.return_value = result
    return chain


@pytest.fixture()
def supabase_table(mock_supabase):
    """Configure ``supabase.table(name)`` to return chainable query mocks.

    Returns a helper that lets individual tests set the data returned for a
    given table name.

    Usage in a test::

        def test_something(client, supabase_table):
            supabase_table("events", [{"id": "1", "name": "Cup"}])
            resp = client.get("/api/events")
    """
    _table_mocks: dict[str, MagicMock] = {}

    def _setup(table_name: str, data=None):
        chain = _chain_mock(data)
        _table_mocks[table_name] = chain
        return chain

    def _side_effect(table_name: str):
        if table_name in _table_mocks:
            return _table_mocks[table_name]
        # Return an empty-data chain for any table not explicitly configured
        return _chain_mock([])

    mock_supabase.table.side_effect = _side_effect
    return _setup


@pytest.fixture()
def client(mock_supabase):
    """Provide a Starlette ``TestClient`` wired to the mocked app."""
    from starlette.testclient import TestClient

    from app.dependencies import get_supabase

    # Register the override for route handlers using Depends(get_supabase)
    app.dependency_overrides[get_supabase] = lambda: mock_supabase

    # Patch supabase in all modules that import it at module level
    with (
        patch("app.dependencies.supabase", mock_supabase),
        patch("app.web.pokedata.supabase", mock_supabase),
    ):
        with TestClient(app) as tc:
            yield tc

    # Clean up overrides after test completes
    app.dependency_overrides.clear()
