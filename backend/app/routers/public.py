import logging
from fastapi import APIRouter, HTTPException, status
from typing import Optional
from app.models import EventResponse, LeagueResponse
from app.main import supabase
from app.services.top20_data import load_top20_payload

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

    # Check which leagues have standings/leaderboards uploaded
    try:
        leaderboards_res = supabase.table('leaderboards').select('leagueId').execute()
        leagues_with_standings = {row['leagueId'] for row in leaderboards_res.data} if leaderboards_res.data else set()
    except Exception as e:
        logger.warning(f"Failed to query leaderboards (falling back to mock default): {e}")
        # In local development where the table might not exist yet, fallback to mock leagues with standings
        leagues_with_standings = {1, 2, 3, 4}

    return [
        {
            "leagueId": league.get("id"),
            "hasStandings": league.get("id") in leagues_with_standings,
            **league
        }
        for league in leagues
    ]


@router.get("/api/players/top20")
async def getTop20Players(season: Optional[str] = None):
    """
    Fetch the top 20 players for a season.
    """
    try:
        return load_top20_payload(season)
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
    

@router.get("/api/sets")
async def getSets():
    """
    Fetch Pokemon TCG set legality dates.
    Returns sets sorted by release date (newest first).
    """
    SETS_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'sets.json')

    try:
        with open(SETS_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    except Exception as e:
        logger.error(f"Failed to fetch sets data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "internal_error", "message": "Failed to fetch sets data"}
        )
