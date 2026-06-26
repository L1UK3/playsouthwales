
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional

from ..models import EventCreate, EventUpdate,EventResponse,EventBase, EventUpdate,LeagueCreate, LeagueUpdate
from main import supabase
from auth import require_auth
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/api/events", status_code=status.HTTP_201_CREATED)
async def createEvent(
    event: EventCreate,
    _auth: dict = Depends(require_auth)
):
    """
    Create a new event. Requires Clerk authorization.
    """
    try:
        eventData = event.model_dump()
        is_recurring = eventData.pop('isRecurring', None)
        tableName = 'weekly_events' if is_recurring == True else 'events'

        res = supabase.table(tableName).insert(eventData).execute()
        if not res.data:
            raise Exception("No data returned from Supabase insert.")

        return {
            'success': True,
            'message': 'Event created successfully'
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create event: {e}")
        raise HTTPException(
            status_code=500,
            detail={"code": "internal_error", "message": str(e)}
        )


@router.patch("/api/events/{eventId}")
@router.put("/api/events/{eventId}")
async def patchEvent(
    eventId: int,
    event: EventUpdate,
    _auth: dict = Depends(require_auth)
):
    """
    Partially update an existing event. Requires Clerk authorization.
    Supports virtual IDs for recurring events.
    """
    try:
        if eventId >= 10000000:
            templateId = eventId // 10000000
            res = supabase.table('weekly_events').select('id').eq('id', templateId).execute()
            if not res.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail={"code": "not_found", "message": "Weekly event template not found"}
                )
            tableName = 'weekly_events'
            targetId = templateId
        else:
            # Check if the event exists in the events table
            res = supabase.table('events').select('id').eq('id', eventId).execute()
            if res.data:
                tableName = 'events'
                targetId = eventId
            else:
                # If not found, check the weekly_events table
                res = supabase.table('weekly_events').select('id').eq('id', eventId).execute()
                if res.data:
                    tableName = 'weekly_events'
                    targetId = eventId
                else:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail={"code": "not_found", "message": "Event not found"}
                    )

        # Perform updates
        eventData = event.model_dump(exclude_unset=True)
        eventData.pop('isRecurring', None) # Pop isRecurring to prevent database mismatch

        # Safely remove fields to prevent PGRST204 schema cache errors if columns are not yet created in the DB
        if tableName == 'events' or ('excludedDates' in eventData and eventData.get('excludedDates') is None):
            eventData.pop('excludedDates', None)
        if 'directions' in eventData and eventData.get('directions') is None:
            eventData.pop('directions', None)
        if 'accessibility' in eventData and eventData.get('accessibility') is None:
            eventData.pop('accessibility', None)

        if eventData:
            supabase.table(tableName).update(eventData).eq('id', targetId).execute()

        return {
            'success': True,
            'message': 'Event updated successfully'
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update event {eventId}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "internal_error", "message": "An unexpected database error occurred"}
        )

   
@router.delete("/api/events/{eventId}")
async def deleteEvent(
    eventId: int,
    excludeDate: Optional[str] = None,
    _auth: dict = Depends(require_auth)
):
    """
    Delete an event or a weekly event series/occurrence. Requires Clerk authorization.
    """
    try:
        # Check if virtual ID for a recurring event
        if eventId >= 10000000:
            templateId = eventId // 10000000
            res = supabase.table('weekly_events').select('*').eq('id', templateId).execute()
            if not res.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail={"code": "not_found", "message": "Event template not found"}
                )
            
            if excludeDate:
                # Add to excludedDates list in weekly_events
                weekly_event = res.data[0]
                excluded = weekly_event.get('excludedDates') or []
                if excludeDate not in excluded:
                    excluded.append(excludeDate)
                supabase.table('weekly_events').update({'excludedDates': excluded}).eq('id', templateId).execute()
                return {
                    'success': True,
                    'message': f"Occurrence on {excludeDate} excluded successfully"
                }
            else:
                # Delete the entire series
                supabase.table('weekly_events').delete().eq('id', templateId).execute()
                return {
                    'success': True,
                    'message': 'Weekly event series deleted successfully'
                }
        else:
            # Check if the event exists in the events table
            res = supabase.table('events').select('id').eq('id', eventId).execute()
            if res.data:
                tableName = 'events'
            else:
                # If not found, check the weekly_events table
                res = supabase.table('weekly_events').select('id').eq('id', eventId).execute()
                if res.data:
                    tableName = 'weekly_events'
                else:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail={"code": "not_found", "message": "Event not found"}
                    )

            # Perform deletion
            supabase.table(tableName).delete().eq('id', eventId).execute()

            return {
                'success': True,
                'message': 'Event deleted successfully'
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete event {eventId}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "internal_error", "message": "An unexpected database error occurred"}
        )

@router.post("/api/leagues", status_code=status.HTTP_201_CREATED)
async def createLeague(
    league: LeagueCreate,
    _auth: dict = Depends(require_auth)
):
    """
    Create a new league. Requires Clerk authorization.
    """
    try:
        leagueData = league.model_dump()
        res = supabase.table('leagues').insert(leagueData).execute()
        if not res.data:
            raise Exception("Failed to insert league, no data returned.")
        
        newLeagueId = res.data[0]['id']

        return {
            'success': True,
            'leagueId': newLeagueId,
            'message': 'League created successfully'
        }
    except Exception as e:
        logger.error(f"Failed to create league: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "internal_error", "message": str(e)}
        )


@router.patch("/api/leagues/{leagueId}")
@router.put("/api/leagues/{leagueId}")
async def patchLeague(
    leagueId: int,
    league: LeagueUpdate,
    _auth: dict = Depends(require_auth)
):
    """
    Partially update an existing league. Requires Clerk authorization.
    """
    # Verify league exists
    try:
        res = supabase.table('leagues').select('id').eq('id', leagueId).execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "not_found", "message": "League not found"}
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to query league {leagueId}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "internal_error", "message": "An unexpected database error occurred"}
        )

    # Perform updates
    try:
        leagueData = league.model_dump(exclude_unset=True)
        if leagueData:
            supabase.table('leagues').update(leagueData).eq('id', leagueId).execute()
                
        return {
            'success': True,
            'message': 'League updated successfully'
        }
    except Exception as e:
        logger.error(f"Failed to update league {leagueId}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "internal_error", "message": "An unexpected database error occurred"}
        )
