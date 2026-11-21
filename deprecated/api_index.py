"""Serve an HTML guide to the public API at ``/api/``."""

import html
import json
from typing import Any

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse

router = APIRouter()

EVENT_EXAMPLE = {
    "id": 42,
    "name": "Cardiff Challenge",
    "date": "2026-07-15",
    "startTime": "18:30",
    "leagueId": 1,
    "ticketLink": None,
    "eventType": "CHALLENGE",
    "game": "TCG",
    "description": None,
    "prizes": None,
    "entryFee": "Free",
    "excludedDates": None,
}

EVENT_FIELDS = [
    ("id", "Event ID. Expanded recurring dates use a string ID."),
    ("name", "Event name."),
    ("date", "Event date in YYYY-MM-DD format."),
    ("startTime", "Start time in HH:MM format, or null."),
    ("leagueId", "ID of the league that hosts the event."),
    ("ticketLink", "Ticket URL, or null."),
    ("eventType", "Event category, such as CHALLENGE or LEAGUE."),
    ("game", "Game played at the event, such as TCG."),
    ("description", "Free-text description, or null."),
    ("prizes", "Prize details, or null."),
    ("entryFee", "Entry fee as text, or null."),
    ("excludedDates", "Dates (YYYY-MM-DD) skipped by a recurring event."),
]

LEAGUE_EXAMPLE = {
    "leagueId": 1,
    "hasStandings": True,
    "id": 1,
    "name": "Cardiff League",
    "logo": None,
    "website": None,
    "socialLink": None,
    "eventLink": None,
    "brandColor": "#FF0000",
    "webLink": None,
    "location": "Cardiff",
    "latitude": 51.48,
    "longitude": -3.18,
    "directions": None,
    "accessibility": None,
    "isChampionshipSeries": False,
}

LEAGUE_FIELDS = [
    ("leagueId", "League ID. Matches id."),
    ("hasStandings", "True when the league has a leaderboard."),
    ("name", "League name."),
    ("logo", "Logo image URL, or null."),
    ("website", "League website URL, or null."),
    ("socialLink", "Social media URL, or null."),
    ("eventLink", "Event listing URL, or null."),
    ("brandColor", "Brand colour as a hex string, or null."),
    ("webLink", "Additional web link, or null."),
    ("location", "Venue name or address, or null."),
    ("latitude", "Venue latitude, or null."),
    ("longitude", "Venue longitude, or null."),
    ("directions", "Directions to the venue, or null."),
    ("accessibility", "Accessibility notes, or null."),
    ("isChampionshipSeries", "True for Championship Series leagues."),
]

ENDPOINTS: list[dict[str, Any]] = [
    {
        "path": "/api/health",
        "example": "/api/health",
        "summary": "Check that the backend is running.",
        "params": [],
        "fields": [("status", "Always healthy when the server responds.")],
        "response": {"status": "healthy"},
        "errors": [],
    },
    {
        "path": "/api/events",
        "example": "/api/events?month=7&year=2026&leagueId=1",
        "summary": "List events. Combine the query parameters to filter.",
        "params": [
            ("month", "Month number, such as 7."),
            ("year", "Four-digit year, such as 2026."),
            (
                "day",
                "Single date in YYYY-MM-DD format. Expands recurring events.",
            ),
            ("weekly", "Set to true to expand recurring events."),
            ("leagueId", "Return events for one league only."),
        ],
        "fields": EVENT_FIELDS,
        "response": [EVENT_EXAMPLE],
        "errors": [
            ("400", "The day parameter is not a valid YYYY-MM-DD date."),
            ("500", "The server failed to fetch events."),
        ],
    },
    {
        "path": "/api/weekly-events",
        "example": "/api/weekly-events",
        "summary": "List every recurring weekly event.",
        "params": [],
        "fields": EVENT_FIELDS,
        "response": [{**EVENT_EXAMPLE, "id": 7, "eventType": "LEAGUE"}],
        "errors": [("500", "The server failed to fetch weekly events.")],
    },
    {
        "path": "/api/weekly-events/{league_id}",
        "example": "/api/weekly-events/1",
        "summary": "Get the recurring weekly event for one league.",
        "params": [("league_id", "League ID (path parameter).")],
        "fields": EVENT_FIELDS,
        "response": {**EVENT_EXAMPLE, "id": 7, "eventType": "LEAGUE"},
        "errors": [
            ("404", "The league has no weekly event."),
            ("500", "The server failed to fetch the weekly event."),
        ],
    },
    {
        "path": "/api/leagues",
        "example": "/api/leagues",
        "summary": "List every gaming league.",
        "params": [],
        "fields": LEAGUE_FIELDS,
        "response": [LEAGUE_EXAMPLE],
        "errors": [("500", "The server failed to fetch leagues.")],
    },
    {
        "path": "/api/leaderboard/{league_id}",
        "example": "/api/leaderboard/1",
        "summary": "Get the standings for one league.",
        "params": [("league_id", "League ID (path parameter).")],
        "fields": [
            ("id", "Leaderboard row ID."),
            ("created_at", "Timestamp when the leaderboard was created."),
            ("leagueId", "League ID."),
            (
                "data",
                "List of standings entries. Each entry holds a position, "
                "name, wins, losses, draws, attendance, and points.",
            ),
        ],
        "response": {
            "id": 1,
            "created_at": "2026-07-06T22:27:57+00:00",
            "leagueId": 1,
            "data": [
                {
                    "position": 1,
                    "name": "Dylan Hughes",
                    "wins": 28,
                    "losses": 6,
                    "draws": 2,
                    "attendance": 12,
                    "points": 86,
                }
            ],
        },
        "errors": [
            ("404", "The league has no leaderboard."),
            ("500", "The server failed to fetch the leaderboard."),
        ],
    },
    {
        "path": "/api/players/top20",
        "example": "/api/players/top20?season=2026",
        "summary": "Get Welsh player rankings by Championship Points.",
        "params": [
            (
                "season",
                "Season year, such as 2026. Defaults to the current season.",
            )
        ],
        "fields": [
            ("season", "Season the rankings belong to."),
            ("availableSeasons", "List of seasons you can request."),
            (
                "players",
                "Object keyed by rank. Each value holds name, cp "
                "(Championship Points), and playerId.",
            ),
        ],
        "response": {
            "season": "2026",
            "availableSeasons": ["2026"],
            "players": {
                "1": {"name": "Megan Davies", "cp": 410, "playerId": 1001},
                "2": {"name": "Dylan Hughes", "cp": 385, "playerId": 1002},
            },
        },
        "errors": [("500", "The server failed to fetch the rankings.")],
    },
    {
        "path": "/api/sets",
        "example": "/api/sets",
        "summary": "List Pokémon TCG sets with their legality dates.",
        "params": [],
        "fields": [
            ("code", "Set code."),
            ("name", "Set name."),
            ("releaseDate", "Release date in YYYY-MM-DD format."),
            ("legalDate", "Tournament legality date in YYYY-MM-DD format."),
            ("format", "Format the set belongs to, such as Standard."),
        ],
        "response": [
            {
                "code": "ME6",
                "name": "Delta Reign",
                "releaseDate": "2026-11-06",
                "legalDate": "2026-11-20",
                "format": "Standard",
            }
        ],
        "errors": [("500", "The server failed to read the sets data.")],
    },
    {
        "path": "/api/regs",
        "example": "/api/regs",
        "summary": "List Pokémon VGC regulations with their start dates.",
        "params": [],
        "fields": [
            ("name", "Regulation name."),
            ("date", "Start date in YYYY-MM-DD format."),
        ],
        "response": [{"name": "Regulation M-A", "date": "2026-04-08"}],
        "errors": [("500", "The server failed to read the regulation data.")],
    },
]

STYLE = """
:root { color-scheme: light dark; --muted: #6b6b6b; --line: #d8d8d8;
  --code-bg: #f4f4f5; --accent: #c0392b; }
@media (prefers-color-scheme: dark) {
  :root { --muted: #a0a0a0; --line: #3a3a3a; --code-bg: #1e1e20;
    --accent: #ff7a6b; }
}
body { font: 16px/1.55 system-ui, sans-serif; margin: 0 auto;
  max-width: 52rem; padding: 1.5rem 1rem 4rem; }
h1 { margin-bottom: 0.25rem; }
h2 { margin-top: 2.5rem; border-bottom: 1px solid var(--line);
  padding-bottom: 0.25rem; }
h3 { margin: 1.25rem 0 0.25rem; font-size: 1rem; }
a { color: var(--accent); }
code, pre { font: 0.9rem ui-monospace, monospace; }
pre { background: var(--code-bg); padding: 0.75rem; overflow-x: auto;
  border-radius: 6px; }
.method { font-weight: 700; margin-right: 0.5rem; }
.muted { color: var(--muted); }
table { border-collapse: collapse; width: 100%; }
td, th { text-align: left; padding: 0.25rem 0.75rem 0.25rem 0;
  vertical-align: top; border-bottom: 1px solid var(--line); }
"""


def _esc(value: str) -> str:
    return html.escape(value, quote=True)


def _table(heading: str, rows: list[tuple[str, str]]) -> str:
    if not rows:
        return ""
    body = "".join(
        f"<tr><td><code>{_esc(name)}</code></td><td>{_esc(text)}</td></tr>"
        for name, text in rows
    )
    return f"<h3>{_esc(heading)}</h3><table>{body}</table>"


def _render_endpoint(endpoint: dict[str, Any], base_url: str) -> str:
    path = endpoint["path"]
    example_url = f"{base_url}{endpoint['example']}"
    example_json = json.dumps(
        endpoint["response"], indent=2, ensure_ascii=False
    )
    return (
        f'<section id="{_esc(path.strip("/").replace("/", "-"))}">'
        f'<h2><span class="method">GET</span><code>{_esc(path)}</code></h2>'
        f"<p>{_esc(endpoint['summary'])}</p>"
        f"{_table('Parameters', endpoint['params'])}"
        f"{_table('Response fields', endpoint['fields'])}"
        "<h3>Example request</h3>"
        f'<pre><code>curl "{_esc(example_url)}"</code></pre>'
        "<h3>Example response</h3>"
        f"<pre><code>{_esc(example_json)}</code></pre>"
        f"{_table('Errors', endpoint['errors'])}"
        "</section>"
    )


def render_page(base_url: str) -> str:
    """Build the HTML guide with example URLs rooted at ``base_url``."""
    sections = "".join(_render_endpoint(e, base_url) for e in ENDPOINTS)
    return (
        "<!doctype html>"
        '<html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1">'
        "<title>Play! South Wales API</title>"
        f"<style>{STYLE}</style></head><body>"
        "<h1>Play! South Wales API</h1>"
        "<p>You can call every endpoint on this page with a GET request. "
        "None of them require authentication, and all of them return "
        "JSON.</p>"
        '<p class="muted">Errors return a JSON body shaped like '
        '<code>{"detail": {"code": "not_found", "message": "..."}}</code>. '
        'For an interactive view, open <a href="/docs">/docs</a>.</p>'
        f"{sections}</body></html>"
    )


@router.get("/api/", response_class=HTMLResponse, include_in_schema=False)
async def api_index(request: Request):
    """Serve an HTML guide that lists the public API endpoints."""
    return render_page(str(request.base_url).rstrip("/"))
