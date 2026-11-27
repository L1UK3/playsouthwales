"""Unit tests for the event service error paths."""

import asyncio
import datetime

import pytest

from app.exceptions import NotFoundError
from app.services.event import create_event, get_events_from_db, patch_event

WEEKLY_EVENT = {
    "id": 1,
    "name": "Weekly Play",
    "date": "2026-08-03",
    "startTime": "18:00",
    "leagueId": 2,
    "ticketLink": None,
    "eventType": "LEAGUE",
    "game": "TCG",
    "description": None,
    "prizes": None,
    "entryFee": "Free",
    "excludedDates": [],
}


class TestCreateEventErrorHandling:
    """Cover the error path where Supabase returns no data on insert."""

    def test_raises_when_standard_event_insert_returns_empty_data(
        self, mock_supabase, supabase_table
    ):
        supabase_table("events", [])

        with pytest.raises(
            Exception, match=r"No data returned from Supabase insert\."
        ):
            asyncio.run(create_event(mock_supabase, {"name": "Cardiff Cup"}))

    def test_raises_when_weekly_event_insert_returns_empty_data(
        self, mock_supabase, supabase_table
    ):
        supabase_table("weekly_events", [])

        with pytest.raises(
            Exception, match=r"No data returned from Supabase insert\."
        ):
            asyncio.run(
                create_event(
                    mock_supabase, {"name": "Weekly Play", "isRecurring": True}
                )
            )

    def test_returns_success_when_supabase_returns_data(
        self, mock_supabase, supabase_table
    ):
        supabase_table("events", [{"id": "evt-1"}])

        result = asyncio.run(
            create_event(mock_supabase, {"name": "Cardiff Cup"})
        )

        assert result == {
            "success": True,
            "message": "Event created successfully",
        }


class TestPatchEventVirtualRouting:
    """Cover virtual event ID extraction and table routing in patch_event."""

    def test_virtual_id_routes_to_weekly_events(
        self, mock_supabase, supabase_table
    ):
        supabase_table("weekly_events", [{"id": 1}])
        supabase_table("events", [])

        result = asyncio.run(
            patch_event(mock_supabase, "10260805", {"name": "Renamed"})
        )

        weekly_events = mock_supabase.table("weekly_events")
        weekly_events.update.assert_called_once_with({"name": "Renamed"})
        mock_supabase.table("events").update.assert_not_called()
        assert result == {
            "success": True,
            "message": "Event updated successfully",
        }

    def test_virtual_id_raises_when_template_missing(
        self, mock_supabase, supabase_table
    ):
        supabase_table("weekly_events", [])
        supabase_table("events", [])

        with pytest.raises(
            NotFoundError, match="Weekly event template not found"
        ):
            asyncio.run(
                patch_event(mock_supabase, "10260805", {"name": "Renamed"})
            )

    def test_standard_id_routes_to_events(self, mock_supabase, supabase_table):
        supabase_table("events", [{"id": "evt-abc"}])
        supabase_table("weekly_events", [])

        result = asyncio.run(
            patch_event(mock_supabase, "evt-abc", {"name": "Renamed"})
        )

        mock_supabase.table("events").update.assert_called_once_with(
            {"name": "Renamed"}
        )
        mock_supabase.table("weekly_events").update.assert_not_called()
        assert result == {
            "success": True,
            "message": "Event updated successfully",
        }

    def test_standard_id_falls_back_to_weekly_events(
        self, mock_supabase, supabase_table
    ):
        supabase_table("events", [])
        supabase_table("weekly_events", [{"id": 1}])

        result = asyncio.run(
            patch_event(mock_supabase, "1", {"name": "Renamed"})
        )

        weekly_events = mock_supabase.table("weekly_events")
        weekly_events.update.assert_called_once_with({"name": "Renamed"})
        assert result == {
            "success": True,
            "message": "Event updated successfully",
        }

    def test_unknown_id_raises_not_found(self, mock_supabase, supabase_table):
        supabase_table("events", [])
        supabase_table("weekly_events", [])

        with pytest.raises(NotFoundError, match="Event not found"):
            asyncio.run(patch_event(mock_supabase, "999", {"name": "Renamed"}))


class TestGetEventsFromDbRecurring:
    """Cover recurring event expansion edge cases in get_events_from_db."""

    def test_expands_weekly_events_with_empty_exclusion_list(
        self, mock_supabase, supabase_table
    ):
        supabase_table("events", [])
        supabase_table("weekly_events", [WEEKLY_EVENT])

        events = asyncio.run(
            get_events_from_db(
                mock_supabase,
                start_date=datetime.date(2026, 8, 3),
                end_date=datetime.date(2026, 8, 10),
                expand_recurring=True,
            )
        )

        by_id = {event["id"]: event for event in events}
        assert len(by_id) == 2
        assert by_id[10260803]["date"] == "2026-08-03"
        assert by_id[10260810]["date"] == "2026-08-10"
        assert by_id[10260803]["name"] == "Weekly Play"

    def test_respects_excluded_dates(self, mock_supabase, supabase_table):
        weekly_event = {**WEEKLY_EVENT, "excludedDates": ["2026-08-10"]}
        supabase_table("events", [])
        supabase_table("weekly_events", [weekly_event])

        events = asyncio.run(
            get_events_from_db(
                mock_supabase,
                start_date=datetime.date(2026, 8, 3),
                end_date=datetime.date(2026, 8, 10),
                expand_recurring=True,
            )
        )

        ids = [event["id"] for event in events]
        assert 10260803 in ids
        assert 10260810 not in ids

    @pytest.mark.parametrize(
        "invalid_weekly_event",
        [
            {**WEEKLY_EVENT, "date": "not-a-date"},
            {k: v for k, v in WEEKLY_EVENT.items() if k != "date"},
            {**WEEKLY_EVENT, "date": None},
        ],
        ids=["invalid-iso-date", "missing-date-key", "null-date"],
    )
    def test_skips_weekly_events_with_unparseable_start_date(
        self, mock_supabase, supabase_table, invalid_weekly_event
    ):
        supabase_table("events", [])
        supabase_table("weekly_events", [invalid_weekly_event])

        events = asyncio.run(
            get_events_from_db(
                mock_supabase,
                start_date=datetime.date(2026, 8, 3),
                end_date=datetime.date(2026, 8, 10),
                expand_recurring=True,
            )
        )

        assert events == []

    def test_skips_invalid_event_but_expands_valid_ones(
        self, mock_supabase, supabase_table
    ):
        invalid = {**WEEKLY_EVENT, "date": "not-a-date"}
        valid = {**WEEKLY_EVENT, "id": 2}
        supabase_table("events", [])
        supabase_table("weekly_events", [invalid, valid])

        events = asyncio.run(
            get_events_from_db(
                mock_supabase,
                start_date=datetime.date(2026, 8, 3),
                end_date=datetime.date(2026, 8, 10),
                expand_recurring=True,
            )
        )

        ids = [event["id"] for event in events]
        assert 20260803 in ids
        assert 20260810 in ids
        assert len(events) == 2
