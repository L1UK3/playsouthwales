import logging
from datetime import UTC, datetime

from supabase import Client

from app.exceptions import NotFoundError

logger = logging.getLogger(__name__)


async def get_leaderboard(db: Client, league_id: int) -> dict:
    """Retrieve the standings leaderboard for a specific league."""
    res = (
        db.table("leaderboards").select("*").eq("leagueId", league_id).execute()
    )
    if not res.data:
        raise NotFoundError("Leaderboard not found")
    return res.data[0]


async def update_leaderboard(
    db: Client, league_id: int, leaderboard_data: list[dict]
) -> dict:
    """Upsert the standings leaderboard data for a specific league."""
    existing = (
        db.table("leaderboards")
        .select("id")
        .eq("leagueId", league_id)
        .execute()
    )

    if existing.data:
        db.table("leaderboards").update({"data": leaderboard_data}).eq(
            "leagueId", league_id
        ).execute()
    else:
        db.table("leaderboards").insert(
            {"leagueId": league_id, "data": leaderboard_data}
        ).execute()

    return {"success": True, "message": "Leaderboard updated successfully"}


async def get_top20(db: Client, season: str | None = None) -> dict:
    """Retrieve the top 20 Welsh players by Championship Points (CP)."""
    now = datetime.now(UTC)
    season_year = now.year + 1 if now.month >= 7 else now.year
    current_season = str(season_year)
    selected_season = season or current_season
    available_seasons = [str(season_year - 1), str(season_year)]

    res = (
        db.table("welsh_players")
        .select("name, cp")
        .order("cp", desc=True)
        .limit(20)
        .execute()
    )
    players_data = res.data or []

    players = {
        str(i + 1): {
            "name": p["name"],
            "cp": p.get("cp", 0) if p.get("cp") is not None else 0,
        }
        for i, p in enumerate(players_data)
    }

    return {
        "season": selected_season,
        "availableSeasons": available_seasons,
        "players": players,
    }
