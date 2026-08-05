"""Unit tests for the event service error paths."""

import asyncio

import pytest

from app.services.event import create_event


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
