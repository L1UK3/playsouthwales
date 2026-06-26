
import json
import os
import os

from fastapi import APIRouter, HTTPException, status
from typing import Optional
from backend.app.models import EventResponse, LeagueResponse
from backend.app.utils import loadTop20
from main import supabase
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/api/health")
async def healthCheck():
    """
    Lightweight endpoint for server health checks and warmups.
    """
    return {"status": "healthy"}



@router.get("/api/events", response_model=list[EventResponse])
async def getEvents(
    month: Optional[str] = None,
    year: Optional[str] = None,
    leagueId: Optional[int] = None
):
    """
    Fetch standard events, optionally filtered by leagueId, month, and year.
    """
    mainQuery = supabase.table('events').select('*')

    if leagueId is not None:
        mainQuery = mainQuery.eq('leagueId', leagueId)

    if month and year:
        datePrefix = f"{year}-{month.zfill(2)}"
        mainQuery = mainQuery.like('date', f"{datePrefix}%")

    try:
        mainResult = mainQuery.execute()
        events = mainResult.data or []
    except Exception as e:
        logger.error(f"Failed to fetch events from Supabase: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "internal_error", "message": "Failed to fetch events"}
        )

    return events


@router.get("/api/weekly-events", response_model=list[EventResponse])
async def getWeeklyEvents():
    """
    Fetch all weekly events.
    """
    try:
        res = supabase.table('weekly_events').select('*').execute()
        events = res.data or []
    except Exception as e:
        logger.error(f"Failed to fetch weekly events from Supabase: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "internal_error", "message": "Failed to fetch weekly events"}
        )

    return events


@router.get("/api/weekly-events/{leagueId}", response_model=EventResponse)
async def getWeeklyEvent(leagueId: int):
    """
    Fetch a specific weekly event by its league ID.
    """
    try:
        res = supabase.table('weekly_events').select('*').eq('leagueId', leagueId).execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "not_found", "message": "Weekly event not found"}
            )
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch weekly event {leagueId} from Supabase: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "internal_error", "message": "Failed to fetch weekly event"}
        )
    
    
@router.get("/api/leagues", response_model=list[LeagueResponse])
async def getLeagues():
    """
    Fetch all leagues.
    """
    try:
        res = supabase.table('leagues').select('*').execute()
        leagues = res.data or []
    except Exception as e:
        logger.error(f"Failed to fetch leagues from Supabase: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "internal_error", "message": "Failed to fetch leagues"}
        )

    return [{"leagueId": league.get("id"), **league} for league in leagues]


@router.get("/api/players/top20")
async def getTop20Players():
    """
    Fetch the top 20 players.
    """
    TOP20_PATH = os.path.join(os.path.dirname(__file__), 'data', 'top20.json')

    try:
        with open(TOP20_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    except Exception as e:
        logger.error(f"Failed to fetch top 20 players: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "internal_error", "message": "Failed to fetch top 20 players"}
        )
    

@router.get("/api/leaderboard/{leagueId}")
async def getLeaderboard(leagueId: int):
    """
    Fetch the leaderboard for a specific league.
    """
    try:
        res = supabase.table('leaderboards').select('*').eq('leagueId', leagueId).execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "not_found", "message": "Leaderboard not found"}
            )
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch leaderboard {leagueId} from Supabase: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "internal_error", "message": "Failed to fetch leaderboard"}
        )
    