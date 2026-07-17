import logging
from supabase import Client

from app.services.exceptions import NotFoundError

logger = logging.getLogger(__name__)


async def get_leaderboard(db: Client, league_id: int) -> dict:
    """Fetch the leaderboard for a specific league."""
    res = (
        db.table("leaderboards")
        .select("*")
        .eq("leagueId", league_id)
        .execute()
    )
    if not res.data:
        raise NotFoundError("Leaderboard not found")
    return res.data[0]


async def update_leaderboard(
    db: Client, league_id: int, leaderboard_data: list[dict]
) -> dict:
    """Upsert the leaderboard data for a specific league."""
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
