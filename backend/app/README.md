
Fetching from pokedata will only return one-off events not weekly recurring events
(only the `events` table should be accessed not `weekly_events`)

Pokedata request URLs:
```Python
f"https://pokedata.ovh/events/api/_tcg/cups/challenges/pre/_latitude/51.7576404113981/_longitude/-3.5224914550781254/_radius/50/_unit/km"
f"https://pokedata.ovh/events/api/_vg/cups/challenges/_latitude/51.7576404113981/_longitude/-3.5224914550781254/_radius/50/_unit/km"
f"https://pokedata.ovh/events/api/_go/cups/challenges/_latitude/51.7576404113981/_longitude/-3.5224914550781254/_radius/50/_unit/km"
```

Format of a pokedata request:

```JSON
{
    "type": "League Cup",
    "name": "Kraken Gaming Ltd's Pokémon League Mid-Year Celebration 1",
    "date": "2026-07-18",
    "shop": "KRAKEN GAMING LTD",
    "street_address": "None STEPNEY ST, WALES SA15 3TW, GB",
    "state": "Cymru / Wales",
    "city": "Llanelli",
    "postal_code": "",
    "country_code": "GB",
    "pokemon_url": "https://www.pokemon.com/us/pokemon-trainer-club/play-pokemon-tournaments/26-07-001295/",
    "guid": "fccfd164-341d-491e-a6c9-937a72498b21",
    "latitude": "51.6821",
    "longitude": "-4.16229",
    "when": "2026-07-18 14:00:00",
    "status": "",
    "totalPlayers": "0",
    "TCaccounts": "0",
    "juniors": "0",
    "seniors": "0",
    "masters": "0",
    "league": "6237868",
    "category": "",
    "tournament_date": "",
    "tournament_completed": "",
    "date_added": "2026-05-28",
    "product": "tcg",
    "time": "14:00:00",
    "cost": "£6.50",
    "Event_website": "",
    "Third_party_registration_website": ""
  }
```

Refactoring of the guids might be necessary so that admins can edit events without 
the data being reset every hour.
If a guid has been fetched before, don't update its data.

Event table schema: 
```Python
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
```
A class to assign matching data in a pokedata request to the events table class
the id of an event should now match the guid from the raw JSON data. 
make sure that I can manually update the league ids in my production environment so that they match the 
league id from the fetched data.