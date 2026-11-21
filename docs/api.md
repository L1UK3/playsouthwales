# Public API routes

> **Status:** proposed. Nothing on this page is built yet. It replaces the
> reference for the old FastAPI backend, which is in git history. Tracked in
> [#235](https://github.com/L1UK3/playsouthwales/issues/235).

All routes are TanStack Start server routes under `src/routes/api/`. They call
the query functions in `#/db/queries.server.ts` directly, not the server
functions.

## Shared behaviour

| Concern            | Rule                                                                                                                   |
| :----------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **Response format** | JSON. Successful responses wrap the result: `{ "events": [...] }`, `{ "leagues": [...] }`, `{ "rankings": [...] }`     |
| **Error format**   | `{ "error": { "code": string, "message": string } }`                                                                   |
| **CORS**           | `Access-Control-Allow-Origin` on every response. Each route has an `OPTIONS` handler that answers preflight with `204` |
| **Analytics**      | Every API request is recorded with the analytics provider (provider still to be chosen)                                |
| **Caching**        | Not decided yet; see the open questions                                                                                |

### Error codes

| Status | Code                | When                                                  |
| :----- | :------------------ | :---------------------------------------------------- |
| `400`  | `invalid_parameter` | A query parameter is missing or malformed             |
| `404`  | `not_found`         | An unknown league or player                           |
| `500`  | `internal_error`    | Unexpected failure, logged with `console.error`       |
| `503`  | `unavailable`       | The health check can't reach D1                       |

## `GET /api/health`

Health check for uptime monitors. Workers stay online all the time, so no
stay-alive cron is needed.

- Runs `SELECT 1` against D1.
- Returns `200 { "status": "ok", "db": "ok" }`.
- Returns `503 { "status": "error", "db": "error" }` if the query fails.

## `GET /api/events`

Returns events, filtered and optionally grouped.

| Query parameter | Type                                  | Description                                                                 |
| :-------------- | :------------------------------------ | :-------------------------------------------------------------------------- |
| `leagueId`      | integer                               | Only events from this league. `404` if the league doesn't exist             |
| `day`           | `YYYY-MM-DD`                          | Only events on this day                                                     |
| `month`         | `YYYY-MM`                             | Only events in this month                                                   |
| `year`          | `YYYY`                                | Only events in this year (needs a range limit; see the open questions)     |
| `groupBy`       | `league` \| `day` \| `month` \| `year` | Group results by this key. Without it, the response is a flat list          |

- **Source:** `querySchedule(month, false)`. Its `month` parameter has to be
  widened to accept a day, a year or a date range.
- **Excluded dates:** excluded occurrences of weekly events are left out.
- **Returns:**
  - `200 { "events": Event[] }`
  - or, with `groupBy`, `200 { "events": { [key]: Event[] } }`
- **Errors:** `400` for an invalid date or `groupBy`, `404` for an unknown
  `leagueId`.

## `GET /api/leagues`

Returns every league.

- **Source:** `queryLeagues()`.
- **Returns:** `200 { "leagues": League[] }`.

## `GET /api/rankings`

Returns National Rankings by Championship Points.

| Query parameter | Type    | Description                                       |
| :-------------- | :------ | :------------------------------------------------ |
| `season`        | `YYYY`  | Season to return. Defaults to `currentSeason()`   |
| `playerId`      | integer | Only this player. `404` if there's no such player |
| `playerName`    | string  | Only players whose name matches                   |

- **Source:** `queryRankings()`.
- **Returns:** `200 { "season": number, "rankings": { position, name, cp }[] }`.
- **Errors:** `400` for an invalid `season`, `404` for an unknown player.

## Open questions

1. **Seasons ([#238](https://github.com/L1UK3/playsouthwales/issues/238)):**
   the `players` table holds one season, with one `cp` per player. Previous
   seasons, `total_points` and the choice between grouping by player or by
   season all need a per-season table first. Until then, `season` accepts only
   the current season.
2. **Public player profiles:** `docs/CONTEXT.md` says there are none. Do
   `playerId` and `playerName` filters count as profiles?
3. **Event range limit:** weekly events are expanded per month. A request with
   only `year` set expands 12 months, and a request with no date filter can't
   be expanded at all. Should a date filter be required, with a maximum range?
4. **Analytics provider:** which one, and does it log every call or only
   counts?
5. **CORS origin:** `*`, or a list of allowed origins?
6. **Caching:** whether to send `Cache-Control` on GET responses, and for how
   long.
7. **`GET /api/` index page:** #235 also asks for the HTML API guide (the old
   `src/routes/api/api_index.py`). Should it be in this list?
