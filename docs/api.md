---
meta.contentType: Reference
---

# REST API reference

The Play! South Wales backend exposes a REST API running on port `5000`. The Discord bot also provides a lightweight HTTP notification server on port `5001`.

## Authentication

Public endpoints require no authentication credentials. Administrative endpoints require a valid Clerk JWT passed in the HTTP request header:

```http
Authorization: Bearer <clerk_session_token>
```

Requests lacking a valid bearer token return HTTP status `401 Unauthorized`.

## Public endpoints

| Method | Endpoint                         | Description                                       | Query parameters                             |
| :----- | :------------------------------- | :------------------------------------------------ | :------------------------------------------- |
| `GET`  | `/api/health`                    | Check backend server health                       | None                                         |
| `GET`  | `/api/events`                    | List tournament events                            | `month`, `year`, `day`, `weekly`, `leagueId` |
| `GET`  | `/api/weekly-events`             | List all weekly recurring event templates         | None                                         |
| `GET`  | `/api/weekly-events/{league_id}` | Get the recurring event template for a league     | None                                         |
| `GET`  | `/api/leagues`                   | List all active gaming leagues                    | None                                         |
| `GET`  | `/api/leaderboard/{league_id}`   | Get standings leaderboard for a league            | None                                         |
| `GET`  | `/api/players/top20`             | Get Welsh player rankings and Championship Points | `season` (e.g. `2026`)                       |
| `GET`  | `/api/sets`                      | List Pokémon TCG set legality dates               | None                                         |
| `GET`  | `/api/regs`                      | List Pokémon VGC regulation schedules             | None                                         |

## Protected endpoints

Protected routes enforce authorization via the [require_auth](file:///d:/Projects/playsouthwales/backend/app/auth.py) dependency.

| Method   | Endpoint                        | Description                               | Request body                                                                            |
| :------- | :------------------------------ | :---------------------------------------- | :-------------------------------------------------------------------------------------- |
| `POST`   | `/api/events`                   | Create a single calendar event            | [`EventCreate`](file:///d:/Projects/playsouthwales/backend/app/models.py) payload       |
| `PATCH`  | `/api/events/{id}`              | Partially update an existing event        | [`EventUpdate`](file:///d:/Projects/playsouthwales/backend/app/models.py) payload       |
| `PUT`    | `/api/events/{id}`              | Update an existing event                  | [`EventUpdate`](file:///d:/Projects/playsouthwales/backend/app/models.py) payload       |
| `DELETE` | `/api/events/{id}`              | Delete an event or date occurrence        | Query param: `excludeDate` (`YYYY-MM-DD`)                                               |
| `POST`   | `/api/events/sync-pokedata`     | Trigger manual Pokédata tournament scrape | None                                                                                    |
| `POST`   | `/api/events/sync-championship` | Trigger manual Championship Series sync   | None                                                                                    |
| `POST`   | `/api/leagues`                  | Create a new gaming league                | [`LeagueCreate`](file:///d:/Projects/playsouthwales/backend/app/models.py) payload      |
| `PATCH`  | `/api/leagues/{id}`             | Partially update a gaming league          | [`LeagueUpdate`](file:///d:/Projects/playsouthwales/backend/app/models.py) payload      |
| `PUT`    | `/api/leagues/{id}`             | Update a gaming league                    | [`LeagueUpdate`](file:///d:/Projects/playsouthwales/backend/app/models.py) payload      |
| `DELETE` | `/api/leagues/{id}`             | Delete an existing league                 | None                                                                                    |
| `PUT`    | `/api/leaderboard/{id}`         | Upsert league standings leaderboard       | [`LeaderboardUpdate`](file:///d:/Projects/playsouthwales/backend/app/models.py) payload |

## Discord bot HTTP notifier endpoints

Base URL: `http://localhost:5001`

| Method | Endpoint      | Description                       | Request body                                   |
| :----- | :------------ | :-------------------------------- | :--------------------------------------------- |
| `GET`  | `/health`     | Health check for bot process      | None                                           |
| `GET`  | `/api/health` | Health check alias                | None                                           |
| `POST` | `/api/notify` | Send message to a Discord channel | `{"channelId": "string", "message": "string"}` |
| `POST` | `/api/emit`   | Emit a custom event to the bot    | `{"event": "string", "data": any}`             |

## Schema payloads

### Event creation (`EventCreate`)

```json
{
    "name": "Cardiff Pokémon League Cup",
    "date": "2026-10-15",
    "startTime": "10:30",
    "leagueId": 1,
    "eventType": "League Cup",
    "format": "Standard",
    "entryFee": "£15",
    "description": "Registration opens at 10:00 AM."
}
```

### League creation (`LeagueCreate`)

```json
{
    "name": "Cardiff Pokémon Club",
    "location": "Cardiff, CF10 1EP",
    "postcode": "CF10 1EP",
    "brandColor": "#E3350D",
    "logoUrl": "https://example.com/logo.png",
    "contact": "contact@cardiffpokemon.co.uk"
}
```

### Leaderboard update (`LeaderboardUpdate`)

```json
{
    "data": [
        {
            "rank": 1,
            "player_name": "Ash Ketchum",
            "points": 150,
            "division": "Masters"
        }
    ]
}
```

## Error format

The API returns consistent JSON error envelopes when operations fail:

```json
{
    "detail": {
        "code": "not_found",
        "message": "Event with id 42 not found"
    }
}
```

Common status codes include:

- `400 Bad Request`: Validation failure or malformed date parameter.
- `401 Unauthorized`: Missing or invalid Clerk authentication token.
- `404 Not Found`: Target resource does not exist.
- `500 Internal Server Error`: Unexpected database or upstream network failure.
