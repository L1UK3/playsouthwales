import logging

from backend.app.exceptions import NotFoundError, ValidationError
from supabase import Client

logger = logging.getLogger(__name__)


async def get_leagues(db: Client) -> list[dict]:
    """Retrieve all leagues and flag those with standings leaderboards."""
    res = db.table("leagues").select("*").execute()
    leagues = res.data or []

    try:
        leaderboards_res = db.table("leaderboards").select("leagueId").execute()
        leagues_with_standings = (
            {row["leagueId"] for row in leaderboards_res.data}
            if leaderboards_res.data
            else set()
        )
    except Exception as e:
        logger.warning(
            f"Failed to query leaderboards (falling back to mock default): {e}"
        )
        leagues_with_standings = {1, 2, 3, 4}

    return [
        {
            "leagueId": league.get("id"),
            "hasStandings": league.get("id") in leagues_with_standings,
            **league,
        }
        for league in leagues
    ]


async def create_league(db: Client, league_data: dict) -> dict:
    """Create a new gaming league."""
    res = db.table("leagues").insert(league_data).execute()
    if not res.data:
        raise Exception("Failed to insert league, no data returned.")
    new_league_id = res.data[0]["id"]
    return {
        "success": True,
        "leagueId": new_league_id,
        "message": "League created successfully",
    }


async def patch_league(db: Client, league_id: int, league_data: dict) -> dict:
    """Update details of an existing gaming league."""
    res = db.table("leagues").select("id").eq("id", league_id).execute()
    if not res.data:
        raise NotFoundError("League not found")

    if league_data:
        db.table("leagues").update(league_data).eq("id", league_id).execute()

    return {"success": True, "message": "League updated successfully"}


async def delete_league(db: Client, league_id: int) -> dict:
    """Delete a gaming league and clean up associated events."""
    res = (
        db.table("leagues")
        .select("id", "isChampionshipSeries")
        .eq("id", league_id)
        .execute()
    )
    if not res.data:
        raise NotFoundError("League not found")

    if res.data[0].get("isChampionshipSeries"):
        raise ValidationError(
            "The championship series league cannot be deleted."
        )

    db.table("events").delete().eq("leagueId", league_id).execute()
    db.table("weekly_events").delete().eq("leagueId", league_id).execute()
    db.table("leagues").delete().eq("id", league_id).execute()

    return {"success": True, "message": "League deleted successfully"}
