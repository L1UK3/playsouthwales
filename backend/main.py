import os
import logging
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
from auth import require_auth
from models import (
    LeagueCreate, LeagueUpdate, LeagueResponse,
    EventCreate, EventUpdate, EventResponse
)
from utils import loadTop20

logger = logging.getLogger(__name__)

load_dotenv()

supabaseUrl = os.environ.get("SUPABASE_URL")
supabaseKey = os.environ.get("SUPABASE_SECRET_KEY")

supabase: Client = create_client(
    supabaseUrl, 
    supabaseKey
)

app = FastAPI(
    title="play wales API",
    description="API for managing events and leagues for Play Wales",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# --- API Routes ---

@app.get("/api/events", response_model=list[EventResponse])
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


@app.get("/api/weekly-events", response_model=list[EventResponse])
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


@app.get("/api/weekly-events/{leagueId}", response_model=EventResponse)
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
    

@app.post("/api/events", status_code=status.HTTP_201_CREATED)
async def createEvent(
    event: EventCreate,
    _auth: dict = Depends(require_auth)
):
    """
    Create a new event. Requires Clerk authorization.
    """
    try:
        eventData = event.model_dump()
        tableName = 'weekly_events' if event.isRecurring else 'events'

        res = supabase.table(tableName).insert(eventData).execute()
        if not res.data:
            logger.error(f"No data returned from Supabase insert for event: {eventData}")
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
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "internal_error", "message": str(e)}
        )


@app.patch("/api/events/{eventId}")
@app.put("/api/events/{eventId}")
async def patchEvent(
    eventId: int,
    event: EventUpdate,
    _auth: dict = Depends(require_auth)
):
    """
    Partially update an existing event. Requires Clerk authorization.
    Supports virtual IDs for weekly recurring events.
    """
    # 1. Identify virtual ID and set baseline variables
    realId = eventId
    is_weekly = False
    if eventId >= 10000000:
        realId = eventId // 10000000
        is_weekly = True

    # 2. Verify event exists and determine table name
    tableName = None
    try:
        if is_weekly:
            res = supabase.table('weekly_events').select('id').eq('id', realId).execute()
            if res.data:
                tableName = 'weekly_events'
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail={"code": "not_found", "message": "Event not found"}
                )
        else:
            # Check events table
            res = supabase.table('events').select('id').eq('id', realId).execute()
            if res.data:
                tableName = 'events'
            else:
                # Check weekly_events table
                res_weekly = supabase.table('weekly_events').select('id').eq('id', realId).execute()
                if res_weekly.data:
                    tableName = 'weekly_events'
                else:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail={"code": "not_found", "message": "Event not found"}
                    )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to query event {eventId}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "internal_error", "message": "An unexpected database error occurred"}
        )

    # 3. Perform updates
    try:
        eventData = event.model_dump(exclude_unset=True)

        if eventData:
            supabase.table(tableName).update(eventData).eq('id', realId).execute()
            
        # Write to audit logs
        try:
            admin_id = _auth.get("sub") if _auth else "unknown"
            audit_entry = {
                "adminId": admin_id,
                "eventType": "UPDATE_EVENT",
                "deltaPayload": {"eventId": realId, "table": tableName, "delta": eventData}
            }
            supabase.table('audit_logs').insert(audit_entry).execute()
        except Exception as audit_err:
            logger.error(f"Failed to write audit log: {audit_err}")

        return {
            'success': True,
            'message': 'Event updated successfully'
        }
    except Exception as e:
        logger.error(f"Failed to update event {eventId}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "internal_error", "message": "An unexpected database error occurred"}
        )


@app.delete("/api/events/{eventId}")
async def deleteEvent(
    eventId: int,
    _auth: dict = Depends(require_auth)
):
    """
    Delete an event. Requires Clerk authorization.
    Supports virtual IDs for weekly recurring events.
    """
    # 1. Identify virtual ID
    realId = eventId
    is_weekly = False
    if eventId >= 10000000:
        realId = eventId // 10000000
        is_weekly = True

    # 2. Verify event exists and determine table name
    tableName = None
    try:
        if is_weekly:
            res = supabase.table('weekly_events').select('id').eq('id', realId).execute()
            if res.data:
                tableName = 'weekly_events'
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail={"code": "not_found", "message": "Event not found"}
                )
        else:
            # Check events table first
            res = supabase.table('events').select('id').eq('id', realId).execute()
            if res.data:
                tableName = 'events'
            else:
                # Check weekly_events table
                res_weekly = supabase.table('weekly_events').select('id').eq('id', realId).execute()
                if res_weekly.data:
                    tableName = 'weekly_events'
                else:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail={"code": "not_found", "message": "Event not found"}
                    )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to query event {eventId}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "internal_error", "message": "An unexpected database error occurred"}
        )

    # 3. Delete event
    try:
        supabase.table(tableName).delete().eq('id', realId).execute()
        
        # Write to audit logs
        try:
            admin_id = _auth.get("sub") if _auth else "unknown"
            audit_entry = {
                "adminId": admin_id,
                "eventType": "DELETE_EVENT",
                "deltaPayload": {"eventId": realId, "table": tableName}
            }
            supabase.table('audit_logs').insert(audit_entry).execute()
        except Exception as audit_err:
            logger.error(f"Failed to write audit log: {audit_err}")

        return {
            'success': True,
            'message': 'Event deleted successfully'
        }
    except Exception as e:
        logger.error(f"Failed to delete event {eventId}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "internal_error", "message": str(e)}
        )


@app.get("/api/leagues", response_model=list[LeagueResponse])
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


@app.post("/api/leagues", status_code=status.HTTP_201_CREATED)
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


@app.patch("/api/leagues/{leagueId}")
@app.put("/api/leagues/{leagueId}")
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


@app.delete("/api/leagues/{leagueId}")
async def deleteLeague(
    leagueId: int,
    _auth: dict = Depends(require_auth)
):
    """
    Delete a league and its associated events. Requires Clerk authorization.
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

    # Perform deletion
    try:
        supabase.table('events').delete().eq('leagueId', leagueId).execute()
        supabase.table('weekly_events').delete().eq('leagueId', leagueId).execute()
        supabase.table('leagues').delete().eq('id', leagueId).execute()
        return {
            'success': True,
            'message': 'League deleted successfully'
        }
    except Exception as e:
        logger.error(f"Failed to delete league {leagueId}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "internal_error", "message": str(e)}
        )


@app.get("/api/players/top20")
async def getTop20Players():
    """
    Fetch the top 20 players.
    """
    return loadTop20()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=5000, reload=True)
