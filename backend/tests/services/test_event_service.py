"""Unit tests for the event service error paths."""

import asyncio

import pytest

from app.exceptions import NotFoundError
from app.services.event import create_event, patch_event


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
