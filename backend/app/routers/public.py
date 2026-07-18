import json
import logging
import os

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from app.dependencies import get_supabase
from app.exceptions import NotFoundError
from app.models import EventResponse, LeagueResponse, WeeklyEventResponse
from app.services import event, league

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/api/health")
async def health_check():
    """Run a server health check."""
    return {"status": "healthy"}


@router.get("/api/events", response_model=list[EventResponse])
async def get_events(
    month: str | None = None,
    year: str | None = None,
    day: str | None = None,
    weekly: bool = Query(False),
    league_id: int | None = Query(None, alias="leagueId"),
    db: Client = Depends(get_supabase),
):
    """Retrieve standard and expanded events with optional filtering."""
    import datetime

    day_date = None
    if day:
        try:
            day_date = datetime.date.fromisoformat(day)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "code": "invalid_parameter",
                    "message": "Invalid date format for day parameter. Use YYYY-MM-DD.",
                },
            )

    month_int = int(month) if month else None
    year_int = int(year) if year else None

    try:
        events = await event.get_events_from_db(
            db=db,
            month=month_int,
            year=year_int,
            league_id=league_id,
            day=day_date,
            weekly=weekly,
            expand_recurring=bool(day or weekly),
        )
    except Exception as e:
        logger.error(f"Failed to fetch events: {e}")
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
    """Retrieve all recurring weekly events."""
    try:
        events = await event.get_weekly_events(db)
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
    """Retrieve a specific weekly event by its league ID."""
    try:
        event = await event.get_weekly_event(db, league_id)
        return event
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "not_found",
                "message": str(e),
            },
        )
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
    """Retrieve all active gaming leagues."""
    try:
        leagues = await league.get_leagues(db)
        return leagues
    except Exception as e:
        logger.error(f"Failed to fetch leagues from Supabase: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "internal_error",
                "message": "Failed to fetch leagues",
            },
        )


@router.get("/api/leaderboard/{league_id}")
async def get_leaderboard(league_id: int, db: Client = Depends(get_supabase)):
    """Retrieve the standings leaderboard for a specific league."""
    try:
        leaderboard = await leaderboard.get_leaderboard(db, league_id)
        return leaderboard
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "not_found",
                "message": str(e),
            },
        )
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
    """Retrieve TCG set legality dates sorted by release date."""
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
