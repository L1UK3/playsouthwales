import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from app.auth import require_auth
from app.dependencies import get_supabase
from app.models import (
    EventCreate,
    EventUpdate,
    LeaderboardUpdate,
    LeagueCreate,
    LeagueUpdate,
)
from app.services.pokedata_sync import sync_pokedata
from app.services.sets_scraper import run_sets_sync

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/api/events", status_code=status.HTTP_201_CREATED)
async def create_event(
    event: EventCreate,
    auth: dict = Depends(require_auth),
    db: Client = Depends(get_supabase),
):
    """
    Create a new event. Requires Clerk authorization.
    """
    try:
        event_data = event.model_dump()
        is_recurring = event_data.pop("isRecurring", None)
        table_name = "weekly_events" if is_recurring else "events"

        res = db.table(table_name).insert(event_data).execute()
        if not res.data:
            raise Exception("No data returned from Supabase insert.")

        return {"success": True, "message": "Event created successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create event: {e}")
        raise HTTPException(
            status_code=500,
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
    """
    Partially update an existing event. Requires Clerk authorization.
    Supports virtual IDs for recurring events.
    """
    try:
        is_virtual = False
        try:
            val = int(event_id)
            if val >= 10000000:
                is_virtual = True
                template_id = val // 10000000
        except ValueError:
            pass

        if is_virtual:
            res = (
                db.table("weekly_events")
                .select("id")
                .eq("id", template_id)
                .execute()
            )
            if not res.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail={
                        "code": "not_found",
                        "message": "Weekly event template not found",
                    },
                )
            table_name = "weekly_events"
            target_id = template_id
        else:
            # Check if the event exists in the events table
            res = db.table("events").select("id").eq("id", event_id).execute()
            if res.data:
                table_name = "events"
                target_id = event_id
            else:
                # If not found, check the weekly_events table (where ID is integer)
                try:
                    int_id = int(event_id)
                    res = (
                        db.table("weekly_events")
                        .select("id")
                        .eq("id", int_id)
                        .execute()
                    )
                    if res.data:
                        table_name = "weekly_events"
                        target_id = int_id
                    else:
                        raise ValueError()
                except ValueError:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail={
                            "code": "not_found",
                            "message": "Event not found",
                        },
                    )

        # Perform updates
        event_data = event.model_dump(exclude_unset=True)
        event_data.pop(
            "isRecurring", None
        )  # Pop isRecurring to prevent database mismatch

        # Safely remove fields to prevent PGRST204 schema cache errors if columns are not yet created in the DB
        if table_name == "events" or (
            "excludedDates" in event_data
            and event_data.get("excludedDates") is None
        ):
            event_data.pop("excludedDates", None)

        if event_data:
            db.table(table_name).update(event_data).eq(
                "id", target_id
            ).execute()

        return {"success": True, "message": "Event updated successfully"}
    except HTTPException:
        raise
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
    """
    Delete an event or a weekly event series/occurrence. Requires Clerk authorization.
    """
    try:
        is_virtual = False
        try:
            val = int(event_id)
            if val >= 10000000:
                is_virtual = True
                template_id = val // 10000000
        except ValueError:
            pass

        # Check if virtual ID for a recurring event
        if is_virtual:
            res = (
                db.table("weekly_events")
                .select("*")
                .eq("id", template_id)
                .execute()
            )
            if not res.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail={
                        "code": "not_found",
                        "message": "Event template not found",
                    },
                )

            if exclude_date:
                # Add to excludedDates list in weekly_events
                weekly_event = res.data[0]
                excluded = weekly_event.get("excludedDates") or []
                if exclude_date not in excluded:
                    excluded.append(exclude_date)
                db.table("weekly_events").update(
                    {"excludedDates": excluded}
                ).eq("id", template_id).execute()
                return {
                    "success": True,
                    "message": f"Occurrence on {exclude_date} excluded successfully",
                }
            else:
                # Delete the entire series
                db.table("weekly_events").delete().eq(
                    "id", template_id
                ).execute()
                return {
                    "success": True,
                    "message": "Weekly event series deleted successfully",
                }
        else:
            # Check if the event exists in the events table
            res = db.table("events").select("id").eq("id", event_id).execute()
            if res.data:
                table_name = "events"
                target_id = event_id
            else:
                # If not found, check the weekly_events table (where ID is integer)
                try:
                    int_id = int(event_id)
                    res = (
                        db.table("weekly_events")
                        .select("id")
                        .eq("id", int_id)
                        .execute()
                    )
                    if res.data:
                        table_name = "weekly_events"
                        target_id = int_id
                    else:
                        raise ValueError()
                except ValueError:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail={
                            "code": "not_found",
                            "message": "Event not found",
                        },
                    )

            # Perform deletion
            db.table(table_name).delete().eq("id", target_id).execute()

            return {"success": True, "message": "Event deleted successfully"}
    except HTTPException:
        raise
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
    """
    Manually trigger the sync of events from pokedata.ovh. Requires Clerk authorization.
    """
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
    """
    Manually trigger the sync of Pokémon TCG sets from Bulbapedia. Requires Clerk authorization.
    """
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


@router.post("/api/leagues", status_code=status.HTTP_201_CREATED)
async def create_league(
    league: LeagueCreate,
    auth: dict = Depends(require_auth),
    db: Client = Depends(get_supabase),
):
    """
    Create a new league. Requires Clerk authorization.
    """
    try:
        league_data = league.model_dump()
        res = db.table("leagues").insert(league_data).execute()
        if not res.data:
            raise Exception("Failed to insert league, no data returned.")

        new_league_id = res.data[0]["id"]

        return {
            "success": True,
            "leagueId": new_league_id,
            "message": "League created successfully",
        }
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
    """
    Partially update an existing league. Requires Clerk authorization.
    """
    # Verify league exists
    try:
        res = db.table("leagues").select("id").eq("id", league_id).execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "not_found", "message": "League not found"},
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to query league {league_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "internal_error",
                "message": "An unexpected database error occurred",
            },
        )

    # Perform updates
    try:
        league_data = league.model_dump(exclude_unset=True)
        if league_data:
            db.table("leagues").update(league_data).eq(
                "id", league_id
            ).execute()

        return {"success": True, "message": "League updated successfully"}
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
    """
    Delete a league. Requires Clerk authorization.
    """
    try:
        # Verify league exists
        res = db.table("leagues").select("id").eq("id", league_id).execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "not_found", "message": "League not found"},
            )

        db.table("events").delete().eq("leagueId", league_id).execute()
        db.table("weekly_events").delete().eq("leagueId", league_id).execute()

        # Perform deletion
        db.table("leagues").delete().eq("id", league_id).execute()

        return {"success": True, "message": "League deleted successfully"}
    except HTTPException:
        raise
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
    """
    Upsert the leaderboard for a specific league. Requires Clerk authorization.
    If a leaderboard row exists for this league, update it; otherwise insert a new one.
    """
    try:
        # Check if a leaderboard already exists for this league
        existing = (
            db.table("leaderboards")
            .select("id")
            .eq("leagueId", league_id)
            .execute()
        )

        if existing.data:
            # Update existing row
            db.table("leaderboards").update({"data": leaderboard.data}).eq(
                "leagueId", league_id
            ).execute()
        else:
            # Insert new row
            db.table("leaderboards").insert(
                {"leagueId": league_id, "data": leaderboard.data}
            ).execute()

        return {"success": True, "message": "Leaderboard updated successfully"}
    except HTTPException:
        raise
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
