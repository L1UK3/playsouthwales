import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from app.auth import require_auth
from app.dependencies import get_supabase
from app.exceptions import NotFoundError, ValidationError
from app.models import (
    EventCreate,
    EventUpdate,
    LeaderboardUpdate,
    LeagueCreate,
    LeagueUpdate,
)
from app.services import event, league
from app.web.championship_series import sync_championship_data
from app.web.pokedata import sync_pokedata
from app.web.sets_releases import run_sets_sync

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/api/events", status_code=status.HTTP_201_CREATED)
async def create_event(
    event: EventCreate,
    auth: dict = Depends(require_auth),
    db: Client = Depends(get_supabase),
):
    """Create a new event."""
    try:
        event_data = event.model_dump()
        result = await event.create_event(db, event_data)
        return result
    except Exception as e:
        logger.error(f"Failed to create event: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "internal_error",
                "message": "Failed to create event",
            },
        )


@router.patch("/api/events/{event_id}")
@router.put("/api/events/{event_id}")
async def patch_event(
    event_id: str,
    event: EventUpdate,
    auth: dict = Depends(require_auth),  # type: ignore
    db: Client = Depends(get_supabase),
):
    """Partially update an existing event, supporting virtual IDs for recurring events."""
    try:
        event_data = event.model_dump(exclude_unset=True)
        result = await event.patch_event(db, event_id, event_data)
        return result
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "not_found",
                "message": str(e),
            },
        )
    except Exception as e:
        logger.error(f"Failed to update event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "internal_error",
                "message": "An unexpected database error occurred",
            },
        )


@router.delete("/api/events/{event_id}")
async def delete_event(
    event_id: str,
    exclude_date: str | None = Query(None, alias="excludeDate"),
    auth: dict = Depends(require_auth),
    db: Client = Depends(get_supabase),
):
    """Delete an event, occurrence, or recurring series."""
    try:
        result = await event.delete_event(db, event_id, exclude_date)
        return result
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "not_found",
                "message": str(e),
            },
        )
    except Exception as e:
        logger.error(f"Failed to delete event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "internal_error",
                "message": "An unexpected database error occurred",
            },
        )


@router.post("/api/events/sync-pokedata")
async def trigger_pokedata_sync(auth: dict = Depends(require_auth)):
    """Trigger a manual synchronization of events from Pokédata."""
    try:
        result = await sync_pokedata()
        if "error" in result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"code": "internal_error", "message": result["error"]},
            )
        return {
            "success": True,
            "message": "Pokedata sync completed",
            "metrics": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to manually run pokedata sync: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "internal_error",
                "message": "Failed to manually run pokedata sync",
            },
        )


@router.post("/api/events/sync-sets")
async def trigger_sets_sync(auth: dict = Depends(require_auth)):
    """Trigger a manual synchronization of TCG sets from Bulbapedia."""
    try:
        result = await run_sets_sync()
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "code": "internal_error",
                    "message": result.get("error", "Failed to sync sets"),
                },
            )
        return {
            "success": True,
            "message": "TCG sets sync completed",
            "metrics": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to manually run sets sync: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "internal_error",
                "message": "Failed to manually run sets sync",
            },
        )


@router.post("/api/events/sync-championship")
async def trigger_championship_sync(auth: dict = Depends(require_auth)):
    """Trigger a manual synchronization of Championship Series events."""
    try:
        result = await sync_championship_data()
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "code": "internal_error",
                    "message": result.get(
                        "error", "Failed to sync championship events"
                    ),
                },
            )
        return {
            "success": True,
            "message": "Championship events sync completed",
            "metrics": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to manually run championship sync: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "internal_error",
                "message": "Failed to manually run championship sync",
            },
        )


@router.post("/api/leagues", status_code=status.HTTP_201_CREATED)
async def create_league(
    league: LeagueCreate,
    auth: dict = Depends(require_auth),
    db: Client = Depends(get_supabase),
):
    """Create a new gaming league."""
    try:
        league_data = league.model_dump()
        result = await league.create_league(db, league_data)
        return result
    except Exception as e:
        logger.error(f"Failed to create league: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "internal_error",
                "message": "Failed to create league",
            },
        )


@router.patch("/api/leagues/{league_id}")
@router.put("/api/leagues/{league_id}")
async def patch_league(
    league_id: int,
    league: LeagueUpdate,
    auth: dict = Depends(require_auth),
    db: Client = Depends(get_supabase),
):
    """Partially update an existing gaming league."""
    try:
        league_data = league.model_dump(exclude_unset=True)
        result = await league.patch_league(db, league_id, league_data)
        return result
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "not_found",
                "message": str(e),
            },
        )
    except Exception as e:
        logger.error(f"Failed to update league {league_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "internal_error",
                "message": "An unexpected database error occurred",
            },
        )


@router.delete("/api/leagues/{league_id}")
async def delete_league(
    league_id: int,
    auth: dict = Depends(require_auth),
    db: Client = Depends(get_supabase),
):
    """Delete a gaming league."""
    try:
        result = await league.delete_league(db, league_id)
        return result
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "not_found",
                "message": str(e),
            },
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "bad_request",
                "message": str(e),
            },
        )
    except Exception as e:
        logger.error(f"Failed to delete league {league_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "internal_error",
                "message": "Failed to delete league",
            },
        )


@router.put("/api/leaderboard/{league_id}")
async def update_leaderboard(
    league_id: int,
    leaderboard: LeaderboardUpdate,
    auth: dict = Depends(require_auth),
    db: Client = Depends(get_supabase),
):
    """Upsert the standings leaderboard for a specific league."""
    try:
        result = await leaderboard.update_leaderboard(
            db, league_id, leaderboard.data
        )
        return result
    except Exception as e:
        logger.error(
            f"Failed to update leaderboard for league {league_id}: {e}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "internal_error",
                "message": "Failed to update leaderboard",
            },
        )
