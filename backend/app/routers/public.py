import json
import logging
import os

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from app.dependencies import get_supabase
from app.models import EventResponse, LeagueResponse, WeeklyEventResponse
from app.services.top20_data import load_top20_payload

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/api/health")
async def health_check():
    """
    Lightweight endpoint for server health checks and warmups.
    """
    return {"status": "healthy"}


@router.get("/api/events", response_model=list[EventResponse])
async def get_events(
    month: str | None = None,
    year: str | None = None,
    league_id: int | None = Query(None, alias="leagueId"),
    db: Client = Depends(get_supabase),
):
    """
    Fetch standard events, optionally filtered by leagueId, month, and year.
    """
    main_query = db.table("events").select("*")

    if league_id is not None:
        main_query = main_query.eq("leagueId", league_id)

    if month and year:
        date_prefix = f"{year}-{month.zfill(2)}"
        main_query = main_query.like("date", f"{date_prefix}%")

    try:
        main_result = main_query.execute()
        events = main_result.data or []
    except Exception as e:
        logger.error(f"Failed to fetch events from Supabase: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "internal_error",
                "message": "Failed to fetch events",
            },
        )

    return events


@router.get("/api/weekly-events", response_model=list[WeeklyEventResponse])
async def get_weekly_events(db: Client = Depends(get_supabase)):
    """
    Fetch all weekly events.
    """
    try:
        res = db.table("weekly_events").select("*").execute()
        events = res.data or []
    except Exception as e:
        logger.error(f"Failed to fetch weekly events from Supabase: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "internal_error",
                "message": "Failed to fetch weekly events",
            },
        )

    return events


@router.get(
    "/api/weekly-events/{league_id}", response_model=WeeklyEventResponse
)
async def get_weekly_event(league_id: int, db: Client = Depends(get_supabase)):
    """
    Fetch a specific weekly event by its league ID.
    """
    try:
        res = (
            db.table("weekly_events")
            .select("*")
            .eq("leagueId", league_id)
            .execute()
        )
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "not_found",
                    "message": "Weekly event not found",
                },
            )
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Failed to fetch weekly event {league_id} from Supabase: {e}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "internal_error",
                "message": "Failed to fetch weekly event",
            },
        )


@router.get("/api/leagues", response_model=list[LeagueResponse])
async def get_leagues(db: Client = Depends(get_supabase)):
    """
    Fetch all leagues.
    """
    try:
        res = db.table("leagues").select("*").execute()
        leagues = res.data or []
    except Exception as e:
        logger.error(f"Failed to fetch leagues from Supabase: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "internal_error",
                "message": "Failed to fetch leagues",
            },
        )

    # Check which leagues have standings/leaderboards uploaded
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
        # In local development where the table might not exist yet, fallback to mock leagues with standings
        leagues_with_standings = {1, 2, 3, 4}

    return [
        {
            "leagueId": league.get("id"),
            "hasStandings": league.get("id") in leagues_with_standings,
            **league,
        }
        for league in leagues
    ]


@router.get("/api/players/top20")
async def get_top_20_players(season: str | None = None):
    """
    Fetch the top 20 players for a season.
    """
    try:
        return load_top20_payload(season)
    except Exception as e:
        logger.error(f"Failed to fetch top 20 players: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "internal_error",
                "message": "Failed to fetch top 20 players",
            },
        )


@router.get("/api/leaderboard/{league_id}")
async def get_leaderboard(league_id: int, db: Client = Depends(get_supabase)):
    """
    Fetch the leaderboard for a specific league.
    """
    try:
        res = (
            db.table("leaderboards")
            .select("*")
            .eq("leagueId", league_id)
            .execute()
        )
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "not_found",
                    "message": "Leaderboard not found",
                },
            )
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Failed to fetch leaderboard {league_id} from Supabase: {e}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "internal_error",
                "message": "Failed to fetch leaderboard",
            },
        )


@router.get("/api/sets")
async def get_sets():
    """
    Fetch Pokemon TCG set legality dates.
    Returns sets sorted by release date (newest first).
    """
    sets_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "data", "sets.json"
    )

    try:
        with open(sets_path, encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        logger.error(f"Failed to fetch sets data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "internal_error",
                "message": "Failed to fetch sets data",
            },
        )
