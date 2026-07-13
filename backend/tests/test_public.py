SAMPLE_EVENT = {
    "id": "abc-123",
    "name": "Cardiff Challenge",
    "date": "2026-07-15",
    "startTime": "18:30",
    "leagueId": 1,
    "ticketLink": None,
    "eventType": "CHALLENGE",
    "game": "TCG",
    "description": None,
    "entryFee": "Free",
    "excludedDates": None,
}

SAMPLE_WEEKLY_EVENT = {
    "id": "1",
    "name": "Weekly Play",
    "date": "2026-05-07",
    "startTime": "18:00",
    "leagueId": 2,
    "ticketLink": None,
    "eventType": "LEAGUE",
    "game": "TCG",
    "description": None,
    "prizes": None,
    "entryFee": "Free",
    "excludedDates": None,
}

SAMPLE_LEAGUE = {
    "id": 1,
    "name": "Cardiff Pokemon League",
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
}

SAMPLE_LEADERBOARD = {
    "leagueId": 1,
    "standings": [{"player": "Ash", "points": 100}],
}


# — /api/health —


class TestHealthEndpoint:
    def test_returns_200_and_healthy(self, client):
        resp = client.get("/api/health")
        assert resp.status_code == 200
        body = resp.json()
        assert body == {"status": "healthy"}

    def test_health_response_schema(self, client):
        """Ensure the body contains exactly one key: 'status'."""
        body = client.get("/api/health").json()
        assert set(body.keys()) == {"status"}


# — /api/events —


class TestEventsEndpoint:
    def test_returns_200_with_list(self, client, supabase_table):
        supabase_table("events", [SAMPLE_EVENT])
        resp = client.get("/api/events")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 1

    def test_event_fields_present(self, client, supabase_table):
        supabase_table("events", [SAMPLE_EVENT])
        event = client.get("/api/events").json()[0]
        for key in ("id", "name", "date", "leagueId", "eventType", "game"):
            assert key in event, f"Missing field: {key}"

    def test_returns_empty_list_when_no_events(self, client, supabase_table):
        supabase_table("events", [])
        resp = client.get("/api/events")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_filters_by_month_and_year(self, client, supabase_table):
        supabase_table("events", [SAMPLE_EVENT])
        resp = client.get("/api/events", params={"month": "7", "year": "2026"})
        assert resp.status_code == 200

    def test_filters_by_league_id(self, client, supabase_table):
        supabase_table("events", [SAMPLE_EVENT])
        resp = client.get("/api/events", params={"leagueId": 1})
        assert resp.status_code == 200

    def test_filters_by_all_params(self, client, supabase_table):
        supabase_table("events", [SAMPLE_EVENT])
        resp = client.get(
            "/api/events",
            params={"month": "7", "year": "2026", "leagueId": 1},
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


# — /api/weekly-events —


class TestWeeklyEventsEndpoint:
    def test_returns_200_with_list(self, client, supabase_table):
        supabase_table("weekly_events", [SAMPLE_WEEKLY_EVENT])
        resp = client.get("/api/weekly-events")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_returns_empty_list(self, client, supabase_table):
        supabase_table("weekly_events", [])
        resp = client.get("/api/weekly-events")
        assert resp.status_code == 200
        assert resp.json() == []


# — /api/weekly-events/{leagueId} —


class TestWeeklyEventByLeagueEndpoint:
    def test_returns_200_when_found(self, client, supabase_table):
        supabase_table("weekly_events", [SAMPLE_WEEKLY_EVENT])
        resp = client.get("/api/weekly-events/2")
        assert resp.status_code == 200
        body = resp.json()
        assert body["leagueId"] == 2

    def test_returns_404_when_not_found(self, client, supabase_table):
        supabase_table("weekly_events", [])
        resp = client.get("/api/weekly-events/999")
        assert resp.status_code == 404
        body = resp.json()
        assert body["detail"]["code"] == "not_found"

    def test_404_response_schema(self, client, supabase_table):
        supabase_table("weekly_events", [])
        body = client.get("/api/weekly-events/999").json()
        assert "detail" in body
        assert "code" in body["detail"]
        assert "message" in body["detail"]


# — /api/leagues —


class TestLeaguesEndpoint:
    def test_returns_200_with_list(self, client, supabase_table):
        supabase_table("leagues", [SAMPLE_LEAGUE])
        supabase_table("leaderboards", [{"leagueId": 1}])
        resp = client.get("/api/leagues")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 1

    def test_league_has_required_fields(self, client, supabase_table):
        supabase_table("leagues", [SAMPLE_LEAGUE])
        supabase_table("leaderboards", [{"leagueId": 1}])
        league = client.get("/api/leagues").json()[0]
        assert "leagueId" in league
        assert "hasStandings" in league

    def test_has_standings_is_true_when_leaderboard_exists(
        self, client, supabase_table
    ):
        supabase_table("leagues", [SAMPLE_LEAGUE])
        supabase_table("leaderboards", [{"leagueId": 1}])
        league = client.get("/api/leagues").json()[0]
        assert league["hasStandings"] is True

    def test_has_standings_is_false_when_no_leaderboard(self, client, supabase_table):
        supabase_table("leagues", [SAMPLE_LEAGUE])
        supabase_table("leaderboards", [])
        league = client.get("/api/leagues").json()[0]
        assert league["hasStandings"] is False

    def test_returns_empty_list(self, client, supabase_table):
        supabase_table("leagues", [])
        supabase_table("leaderboards", [])
        resp = client.get("/api/leagues")
        assert resp.status_code == 200
        assert resp.json() == []


# — /api/players/top20 —


class TestTop20Endpoint:
    def test_returns_200_with_dict(self, client):
        resp = client.get("/api/players/top20")
        assert resp.status_code == 200
        body = resp.json()
        assert isinstance(body, dict)

    def test_contains_expected_player(self, client):
        body = client.get("/api/players/top20").json()
        assert "players" in body

    def test_keys_are_string_ranks(self, client):
        body = client.get("/api/players/top20").json()
        players = body.get("players", {})
        for key in players:
            assert key.isdigit(), f"Expected numeric string key, got '{key}'"


# — /api/leaderboard/{leagueId} —


class TestLeaderboardEndpoint:
    def test_returns_200_when_found(self, client, supabase_table):
        supabase_table("leaderboards", [SAMPLE_LEADERBOARD])
        resp = client.get("/api/leaderboard/1")
        assert resp.status_code == 200
        body = resp.json()
        assert body["leagueId"] == 1

    def test_returns_404_when_not_found(self, client, supabase_table):
        supabase_table("leaderboards", [])
        resp = client.get("/api/leaderboard/999")
        assert resp.status_code == 404

    def test_404_response_has_error_detail(self, client, supabase_table):
        supabase_table("leaderboards", [])
        body = client.get("/api/leaderboard/999").json()
        assert body["detail"]["code"] == "not_found"
        assert "message" in body["detail"]
