"""Unit tests for the league service fallback logic."""

import asyncio

from app.services.league import get_leagues


class TestGetLeaguesFallback:
    """Cover the fallback standings IDs when leaderboards query fails."""

    def test_falls_back_to_default_standings_when_leaderboards_query_fails(
        self, mock_supabase, supabase_table
    ):
        supabase_table(
            "leagues",
            [{"id": 1, "name": "Cardiff"}, {"id": 5, "name": "Swansea"}],
        )
        leaderboard_table = supabase_table("leaderboards")
        leaderboard_table.execute.side_effect = Exception("connection failed")

        leagues = asyncio.run(get_leagues(mock_supabase))

        by_id = {league["id"]: league for league in leagues}
        # 1 is in the fallback set {1, 2, 3, 4}
        assert by_id[1]["hasStandings"] is True
        # 5 is not in the fallback set
        assert by_id[5]["hasStandings"] is False

    def test_uses_leaderboard_data_when_query_succeeds(
        self, mock_supabase, supabase_table
    ):
        supabase_table(
            "leagues",
            [{"id": 1, "name": "Cardiff"}, {"id": 2, "name": "Swansea"}],
        )
        supabase_table("leaderboards", [{"leagueId": 2}])

        leagues = asyncio.run(get_leagues(mock_supabase))

        by_id = {league["id"]: league for league in leagues}
        assert by_id[2]["hasStandings"] is True
        assert by_id[1]["hasStandings"] is False
