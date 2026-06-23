from pydantic import BaseModel
from typing import Optional

class LeagueBase(BaseModel):
    name: str
    logo: Optional[str] = None
    website: Optional[str] = None
    socialLink: Optional[str] = None
    pokemonLink: Optional[str] = None
    brandColor: Optional[str] = None
    webLink: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class LeagueCreate(LeagueBase):
    pass

class LeagueUpdate(BaseModel):
    name: Optional[str] = None
    logo: Optional[str] = None
    website: Optional[str] = None
    socialLink: Optional[str] = None
    pokemonLink: Optional[str] = None
    brandColor: Optional[str] = None
    webLink: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class LeagueResponse(LeagueBase):
    leagueId: int

class EventBase(BaseModel):
    name: str
    date: str
    startTime: Optional[str] = None
    leagueId: int
    ticketLink: Optional[str] = None
    eventType: str
    game: str
    description: Optional[str] = None
    prizes: Optional[str] = None
    entryFee: Optional[str] = None
        
class EventCreate(EventBase):
    isRecurring: Optional[bool] = None

class EventUpdate(BaseModel):
    name: Optional[str] = None
    date: Optional[str] = None
    startTime: Optional[str] = None
    leagueId: Optional[int] = None
    ticketLink: Optional[str] = None
    eventType: Optional[str] = None
    game: Optional[str] = None
    description: Optional[str] = None
    prizes: Optional[str] = None
    entryFee: Optional[str] = None
    isRecurring: Optional[bool] = None

class EventResponse(EventBase):
    id: int
