"""Unit tests for the leaderboard upsert branching logic."""

import asyncio

from app.services.leaderboard import update_leaderboard


class TestUpdateLeaderboard:
    """Cover the insert vs update branches in update_leaderboard."""

    def test_updates_when_leaderboard_already_exists(
        self, mock_supabase, supabase_table
    ):
        supabase_table("leaderboards", [{"id": 1, "leagueId": 5}])

        result = asyncio.run(
            update_leaderboard(
                mock_supabase, 5, [{"player": "Ash", "points": 100}]
            )
        )

        leaderboard_table = mock_supabase.table("leaderboards")
        leaderboard_table.update.assert_called_once_with(
            {"data": [{"player": "Ash", "points": 100}]}
        )
        leaderboard_table.insert.assert_not_called()
        assert result == {
            "success": True,
            "message": "Leaderboard updated successfully",
        }

    def test_inserts_when_leaderboard_missing(
        self, mock_supabase, supabase_table
    ):
        supabase_table("leaderboards", [])

        result = asyncio.run(
            update_leaderboard(
                mock_supabase, 5, [{"player": "Ash", "points": 100}]
            )
        )

        leaderboard_table = mock_supabase.table("leaderboards")
        leaderboard_table.insert.assert_called_once_with(
            {"leagueId": 5, "data": [{"player": "Ash", "points": 100}]}
        )
        leaderboard_table.update.assert_not_called()
        assert result == {
            "success": True,
            "message": "Leaderboard updated successfully",
        }
