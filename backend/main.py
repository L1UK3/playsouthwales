import os
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, logger, status
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
from auth import require_auth
from models import (
    LeagueCreate, LeagueUpdate, LeagueResponse,
    EventCreate, EventUpdate, EventResponse
)
from utils import loadTop20

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
    Fetch events, optionally filtered by leagueId, month, and year.
    """
    query = supabase.table('event').select('*')

    if leagueId is not None:
        query = query.eq('leagueId', leagueId)

    if month and year:
        datePrefix = f"{year}-{month.zfill(2)}"
        query = query.like('date', f"{datePrefix}%")

    try:
        res = query.execute()
        events = res.data or []
        for event in events:
            if 'eventType' in event:
                event['type'] = event.pop('eventType')
    except Exception as e:
        logger.error(f"Failed to fetch events from Supabase: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "internal_error", "message": "Failed to fetch events"}
        )

    return events



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
        if 'type' in eventData:
            eventData['eventType'] = eventData.pop('type')
        res = supabase.table('event').insert(eventData).execute()
        if not res.data:
            raise Exception("No data returned from Supabase insert.")
        
        return {
            'success': True,
            'message': 'Event created successfully'
        }
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
    """
    # Verify event exists
    try:
        res = supabase.table('event').select('id').eq('id', eventId).execute()
        if not res.data:
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

    # Perform updates
    try:
        eventData = event.model_dump(exclude_unset=True)
        if 'type' in eventData:
            eventData['eventType'] = eventData.pop('type')
        if eventData:
            supabase.table('event').update(eventData).eq('id', eventId).execute()
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
    """
    # Verify event exists
    try:
        res = supabase.table('event').select('id').eq('id', eventId).execute()
        if not res.data:
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

    # Delete event
    try:
        supabase.table('event').delete().eq('id', eventId).execute()
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
        res = supabase.table('league').select('*').execute()
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
        res = supabase.table('league').insert(leagueData).execute()
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
        res = supabase.table('league').select('id').eq('id', leagueId).execute()
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
            supabase.table('league').update(leagueData).eq('id', leagueId).execute()
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
        res = supabase.table('league').select('id').eq('id', leagueId).execute()
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
        # Cascade delete all events belonging to the league in Supabase
        supabase.table('event').delete().eq('leagueId', leagueId).execute()
        supabase.table('league').delete().eq('id', leagueId).execute()
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
