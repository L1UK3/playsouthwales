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
    available_seasons = [current_season]

    res = (
        db.table("welsh_players")
        .select('name, cp, "playerId"')
        .order("cp", desc=True, nullsfirst=False)
        .order("name")
        .execute()
    )
    players_data = res.data or []

    players = {
        str(i + 1): {
            "name": p["name"],
            "cp": p.get("cp", 0) if p.get("cp") is not None else 0,
            "playerId": p.get("playerId", 0),
        }
        for i, p in enumerate(players_data)
    }

    return {
        "season": selected_season,
        "availableSeasons": available_seasons,
        "players": players,
    }


async def update_top20(db: Client, players_data: list[dict]) -> dict:
    """Declaratively reconcile the Welsh players table with the provided list.

    Inserts new players, updates CP for existing players, and deletes players
    omitted from the incoming list.
    """
    cleaned_incoming: dict[str, dict] = {}
    for p in players_data:
        name = (p.get("name") or "").strip()
        if not name:
            continue
        cp_val = p.get("cp", 0)
        try:
            cp = int(cp_val) if cp_val is not None else 0
        except (ValueError, TypeError):
            cp = 0
        player_id_val = p.get("playerId", 0)
        try:
            player_id = int(player_id_val) if player_id_val is not None else 0
        except (ValueError, TypeError):
            player_id = 0
        cleaned_incoming[name] = {
            "name": name,
            "cp": cp,
            "playerId": player_id,
        }

    existing_res = (
        db.table("welsh_players").select('id, name, cp, "playerId"').execute()
    )
    existing_players = {
        row["name"]: row for row in (existing_res.data or []) if row.get("name")
    }

    # Delete players omitted from the incoming list
    names_to_delete = [
        name for name in existing_players if name not in cleaned_incoming
    ]
    for name in names_to_delete:
        db.table("welsh_players").delete().eq("name", name).execute()

    # Update existing or insert new players
    for name, item in cleaned_incoming.items():
        if name in existing_players:
            existing_p = existing_players[name]
            if (
                existing_p.get("cp") != item["cp"]
                or existing_p.get("playerId") != item["playerId"]
            ):
                db.table("welsh_players").update(
                    {"cp": item["cp"], "playerId": item["playerId"]}
                ).eq("name", name).execute()
        else:
            db.table("welsh_players").insert(
                {
                    "name": item["name"],
                    "cp": item["cp"],
                    "playerId": item["playerId"],
                }
            ).execute()

    return {
        "success": True,
        "message": "National rankings updated successfully",
    }
