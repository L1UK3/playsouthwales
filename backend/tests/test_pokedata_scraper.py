import asyncio
from unittest.mock import AsyncMock, MagicMock

import httpx
import pytest

from app.web import pokedata_scraper
from app.web.pokedata_scraper import clean_text, fetch_pokedata_events


@pytest.mark.parametrize(
    ("input_text", "expected_text"),
    [
        ("Pok\ufffdmon League Cardiff", "Pokémon League Cardiff"),
        ("Pok\u01e3mon League Newport", "Pokémon League Newport"),
        ("Pok\u01f8mon League Swansea", "Pokémon League Swansea"),
        ("Entry Fee: \ufffd5.00", "Entry Fee: £5.00"),
        ("Standard Event", "Standard Event"),
        ("", ""),
        (None, ""),
    ],
)
def test_clean_text_replaces_invalid_characters(input_text, expected_text):
    """Verify that clean_text removes unicode replacement characters correctly."""
    assert clean_text(input_text) == expected_text


def test_fetch_pokedata_events_retries_on_error_then_succeeds(monkeypatch):
    """Verify fetch_pokedata_events retries transient errors and returns data on success."""
    mock_get = AsyncMock()
    mock_response_ok = MagicMock()
    mock_response_ok.json.return_value = [{"guid": "event-1"}]
    mock_response_ok.raise_for_status = MagicMock()

    # Fail the first attempt with an exception, succeed on second attempt
    mock_get.side_effect = [
        httpx.RequestError("Temporary connection failure"),
        mock_response_ok,
    ]

    monkeypatch.setattr(httpx.AsyncClient, "get", mock_get)

    # Use a short sleep delay for testing to speed up execution
    monkeypatch.setattr(asyncio, "sleep", AsyncMock())

    result = asyncio.run(fetch_pokedata_events("https://example.com/api"))

    assert result == [{"guid": "event-1"}]
    assert mock_get.call_count == 2


def test_fetch_pokedata_events_fails_after_max_retries(monkeypatch):
    """Verify fetch_pokedata_events returns an empty list after max retries exceed."""
    mock_get = AsyncMock()
    mock_get.side_effect = httpx.RequestError("Persistent connection failure")

    monkeypatch.setattr(httpx.AsyncClient, "get", mock_get)
    monkeypatch.setattr(asyncio, "sleep", AsyncMock())

    result = asyncio.run(fetch_pokedata_events("https://example.com/api"))

    assert result == []
    assert mock_get.call_count == 3


def test_sync_pokedata_processes_and_inserts_new_events(
    mock_supabase, supabase_table, monkeypatch
):
    """Verify sync_pokedata processes raw events, filters duplicates, and bulk inserts new ones."""
    # 1. Arrange
    # Configure mock database state
    supabase_table("leagues", [{"id": 1}])
    events_chain = supabase_table("events", [{"id": "existing-123"}])

    # Provide raw mock events representing TCG, VGC, and GO events
    raw_mock_events = [
        {
            "guid": "new-456",
            "name": "League Challenge Cardiff Pok\ufffdmon",
            "date": "2026-07-20",
            "time": "18:30",
            "league": "1",
            "type": "League Challenge",
            "product": "tcg",
            "cost": "£5.00",
            "Third_party_registration_website": "https://tickets.example.com",
            "Event_website": "https://event.example.com",
        },
        {
            "guid": "existing-123",  # Should be skipped (already in database)
            "name": "League Cup Newport",
            "date": "2026-07-21",
            "time": "10:00",
            "league": "1",
            "type": "League Cup",
            "product": "tcg",
        },
        {
            "guid": "noleague-789",  # Should be skipped (league 99 doesn't exist)
            "name": "League Cup Swansea",
            "date": "2026-07-22",
            "time": "11:00",
            "league": "99",
            "type": "League Cup",
            "product": "tcg",
        },
    ]

    # Monkeypatch fetch function to return our raw mock events on first call, empty lists on others
    mock_fetch = AsyncMock()
    mock_fetch.side_effect = [raw_mock_events, [], []]
    monkeypatch.setattr(pokedata_scraper, "fetch_pokedata_events", mock_fetch)
    monkeypatch.setattr(pokedata_scraper, "supabase", mock_supabase)

    # 2. Act
    result = asyncio.run(pokedata_scraper.sync_pokedata())

    # 3. Assert
    assert result == {
        "inserted": 1,
        "skipped_existing": 1,
        "skipped_no_league": 1,
    }

    # Verify that only the new event was inserted into the database
    assert events_chain.insert.call_count == 1
    inserted_chunk = events_chain.insert.call_args.args[0]
    assert len(inserted_chunk) == 1
    inserted_event = inserted_chunk[0]

    assert inserted_event["id"] == "new-456"
    assert inserted_event["name"] == "League Challenge Cardiff Pokémon"
    assert inserted_event["date"] == "2026-07-20"
    assert inserted_event["startTime"] == "18:30"
    assert inserted_event["leagueId"] == 1
    assert inserted_event["ticketLink"] == "https://tickets.example.com"
    assert inserted_event["eventType"] == "CHALLENGE"
    assert inserted_event["game"] == "TCG"
    assert inserted_event["entryFee"] == "£5.00"
