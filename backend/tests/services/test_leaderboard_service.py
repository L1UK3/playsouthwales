"""Unit tests for the leaderboard upsert branching logic."""

import asyncio

from app.services.leaderboard import get_top20, update_leaderboard


class TestGetTop20:
    """Cover the get_top20 service logic."""

    def test_returns_formatted_top20(self, mock_supabase, supabase_table):
        supabase_table(
            "welsh_players",
            [
                {"name": "Luke Enness", "cp": 520},
                {"name": "Thomas Williams", "cp": 380},
            ],
        )

        result = asyncio.run(get_top20(mock_supabase, season="2026-2027"))
        assert result["season"] == "2026-2027"
        assert "2026-2027" in result["availableSeasons"]
        assert result["players"]["1"] == {"name": "Luke Enness", "cp": 520}
        assert result["players"]["2"] == {"name": "Thomas Williams", "cp": 380}

    def test_handles_empty_players(self, mock_supabase, supabase_table):
        supabase_table("welsh_players", [])

        result = asyncio.run(get_top20(mock_supabase))
        assert result["players"] == {}
        assert len(result["availableSeasons"]) == 2


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
