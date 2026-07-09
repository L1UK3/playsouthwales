from pydantic import BaseModel


class LeagueBase(BaseModel):
    id: int | None = None
    name: str
    logo: str | None = None
    website: str | None = None
    socialLink: str | None = None
    eventLink: str | None = None
    brandColor: str | None = None
    webLink: str | None = None
    location: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    directions: str | None = None
    accessibility: str | None = None
    isChampionshipSeries: bool | None = False

class LeagueCreate(LeagueBase):
    pass

class LeagueUpdate(BaseModel):
    id: int | None = None
    name: str | None = None
    logo: str | None = None
    website: str | None = None
    socialLink: str | None = None
    eventLink: str | None = None
    brandColor: str | None = None
    webLink: str | None = None
    location: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    directions: str | None = None
    accessibility: str | None = None
    isChampionshipSeries: bool | None = None

class LeagueResponse(LeagueBase):
    leagueId: int
    hasStandings: bool = False

class EventBase(BaseModel):
    name: str
    date: str
    startTime: str | None = None
    leagueId: int
    ticketLink: str | None = None
    eventType: str
    game: str
    description: str | None = None
    prizes: str | None = None
    entryFee: str | None = None
    excludedDates: list[str] | None = None
        
class EventCreate(EventBase):
    isRecurring: bool | None = None

class EventUpdate(BaseModel):
    name: str | None = None
    date: str | None = None
    startTime: str | None = None
    leagueId: int | None = None
    ticketLink: str | None = None
    eventType: str | None = None
    game: str | None = None
    description: str | None = None
    prizes: str | None = None
    entryFee: str | None = None
    isRecurring: bool | None = None
    excludedDates: list[str] | None = None

class EventResponse(EventBase):
    id: int | str


class WeeklyEventBase(BaseModel):
    name: str
    date: str
    startTime: str | None = None
    leagueId: int
    ticketLink: str | None = None
    eventType: str
    game: str
    description: str | None = None
    prizes: str | None = None
    entryFee: str | None = None
    excludedDates: list[str] | None = None

class WeeklyEventResponse(WeeklyEventBase):
    id: int | str

class LeaderboardUpdate(BaseModel):
    data: list[dict]
