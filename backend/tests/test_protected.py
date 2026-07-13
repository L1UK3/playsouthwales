"""
Tests for protected (authenticated) API routes.

Every endpoint decorated with ``Depends(require_auth)`` must return
401 Unauthorized when no bearer token is supplied.  These tests verify
that the auth gate works without needing a real Clerk token.

Also tests that PATCH aliases behave identically to PUT.
"""

import pytest

# — Helper —

PROTECTED_ROUTES = [
    ("POST", "/api/events"),
    ("PUT", "/api/events/abc-123"),
    ("PATCH", "/api/events/abc-123"),
    ("DELETE", "/api/events/abc-123"),
    ("POST", "/api/events/sync-pokedata"),
    ("POST", "/api/events/sync-sets"),
    ("POST", "/api/leagues"),
    ("PUT", "/api/leagues/1"),
    ("PATCH", "/api/leagues/1"),
    ("DELETE", "/api/leagues/1"),
]


# — Unauthenticated rejection —


class TestProtectedRoutesRejectUnauthenticated:
    """All protected routes must return 401 when no auth token is present."""

    @pytest.mark.parametrize(
        "method,path",
        PROTECTED_ROUTES,
        ids=[f"{m} {p}" for m, p in PROTECTED_ROUTES],
    )
    def test_returns_401_without_auth(self, client, method, path):
        """Sending a request with no Authorization header must be rejected."""
        resp = client.request(method, path)
        assert resp.status_code == 401, (
            f"{method} {path} returned {resp.status_code}, expected 401"
        )

    @pytest.mark.parametrize(
        "method,path",
        PROTECTED_ROUTES,
        ids=[f"{m} {p}" for m, p in PROTECTED_ROUTES],
    )
    def test_401_response_has_detail(self, client, method, path):
        """The 401 response body should include a ``detail`` field."""
        resp = client.request(method, path)
        body = resp.json()
        assert "detail" in body

    @pytest.mark.parametrize(
        "method,path",
        PROTECTED_ROUTES,
        ids=[f"{m} {p}" for m, p in PROTECTED_ROUTES],
    )
    def test_401_includes_www_authenticate_header(self, client, method, path):
        """RFC 7235: 401 responses SHOULD include WWW-Authenticate."""
        resp = client.request(method, path)
        assert "www-authenticate" in resp.headers


# — Invalid bearer token —


class TestProtectedRoutesRejectBadToken:
    """A clearly-invalid bearer token should still be rejected (401)."""

    @pytest.mark.parametrize(
        "method,path",
        PROTECTED_ROUTES,
        ids=[f"{m} {p}" for m, p in PROTECTED_ROUTES],
    )
    def test_returns_401_with_bad_token(self, client, method, path):
        headers = {"Authorization": "Bearer totally-not-a-real-jwt"}
        resp = client.request(method, path, headers=headers)
        assert resp.status_code == 401, (
            f"{method} {path} returned {resp.status_code} with bad token, expected 401"
        )


# — Specific route sanity checks —


class TestProtectedEventRoutes:
    """Spot-checks on individual event routes."""

    def test_post_events_no_auth(self, client):
        resp = client.post(
            "/api/events",
            json={
                "name": "Test Event",
                "date": "2026-08-01",
                "leagueId": 1,
                "eventType": "CUP",
                "game": "TCG",
            },
        )
        assert resp.status_code == 401

    def test_put_events_no_auth(self, client):
        resp = client.put("/api/events/abc-123", json={"name": "Updated"})
        assert resp.status_code == 401

    def test_delete_events_no_auth(self, client):
        resp = client.delete("/api/events/abc-123")
        assert resp.status_code == 401

    def test_sync_pokedata_no_auth(self, client):
        resp = client.post("/api/events/sync-pokedata")
        assert resp.status_code == 401

    def test_sync_sets_no_auth(self, client):
        resp = client.post("/api/events/sync-sets")
        assert resp.status_code == 401


class TestProtectedLeagueRoutes:
    """Spot-checks on individual league routes."""

    def test_post_leagues_no_auth(self, client):
        resp = client.post("/api/leagues", json={"name": "New League"})
        assert resp.status_code == 401

    def test_put_leagues_no_auth(self, client):
        resp = client.put("/api/leagues/1", json={"name": "Updated"})
        assert resp.status_code == 401

    def test_delete_leagues_no_auth(self, client):
        resp = client.delete("/api/leagues/1")
        assert resp.status_code == 401
