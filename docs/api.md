---
meta.contentType: Reference
---

# REST API Reference

Base URL: `http://localhost:5000`

Protected routes require `Authorization: Bearer <clerk_session_token>`.

## Public endpoints

| Method | Endpoint                         | Description                        | Query params                                 |
| :----- | :------------------------------- | :--------------------------------- | :------------------------------------------- |
| `GET`  | `/api/health`                    | Server health check                | None                                         |
| `GET`  | `/api/events`                    | List tournament events             | `month`, `year`, `day`, `weekly`, `leagueId` |
| `GET`  | `/api/weekly-events`             | List recurring event templates     | None                                         |
| `GET`  | `/api/weekly-events/{league_id}` | Get weekly template for a league   | None                                         |
| `GET`  | `/api/leagues`                   | List all gaming leagues            | None                                         |
| `GET`  | `/api/leaderboard/{league_id}`   | Get league standings               | None                                         |
| `GET`  | `/api/sets`                      | List card expansion legality dates | None                                         |
| `GET`  | `/api/regs`                      | List VGC regulation schedules      | None                                         |

## Protected endpoints (Auth required)

| Method   | Endpoint                        | Description                       | Payload                                          |
| :------- | :------------------------------ | :-------------------------------- | :----------------------------------------------- |
| `POST`   | `/api/events`                   | Create new event                  | `{"name", "date", "startTime", "leagueId", ...}` |
| `PATCH`  | `/api/events/{id}`              | Update event                      | Fields to update                                 |
| `DELETE` | `/api/events/{id}`              | Delete event or occurrence        | Optional `?excludeDate=YYYY-MM-DD`               |
| `POST`   | `/api/events/sync-pokedata`     | Trigger Pokédata tournament sync  | None                                             |
| `POST`   | `/api/events/sync-sets`         | Trigger Bulbapedia card sets sync | None                                             |
| `POST`   | `/api/events/sync-championship` | Trigger Championship series sync  | None                                             |
| `POST`   | `/api/leagues`                  | Create new league                 | `{"name", "location", "brandColor", ...}`        |
| `PATCH`  | `/api/leagues/{id}`             | Update league details             | Fields to update                                 |
| `DELETE` | `/api/leagues/{id}`             | Delete a league                   | None                                             |
| `PUT`    | `/api/leaderboard/{id}`         | Upsert standings                  | `{"data": [...]}`                                |

## Error format

```json
{
    "detail": {
        "code": "not_found",
        "message": "Resource not found"
    }
}
```
