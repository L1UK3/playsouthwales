from pydantic import BaseModel
from typing import Optional, Union

class LeagueBase(BaseModel):
    id: Optional[int] = None
    name: str
    logo: Optional[str] = None
    website: Optional[str] = None
    socialLink: Optional[str] = None
    eventLink: Optional[str] = None
    brandColor: Optional[str] = None
    webLink: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    directions: Optional[str] = None
    accessibility: Optional[str] = None

class LeagueCreate(LeagueBase):
    pass

class LeagueUpdate(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    logo: Optional[str] = None
    website: Optional[str] = None
    socialLink: Optional[str] = None
    eventLink: Optional[str] = None
    brandColor: Optional[str] = None
    webLink: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    directions: Optional[str] = None
    accessibility: Optional[str] = None

class LeagueResponse(LeagueBase):
    leagueId: int
    hasStandings: bool = False

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
    excludedDates: Optional[list[str]] = None
        
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
    excludedDates: Optional[list[str]] = None

class EventResponse(EventBase):
    id: Union[int, str]
