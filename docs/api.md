# Public API

All responses are JSON. Errors return:

```json
{ "error": { "code": "invalid_parameter", "message": "Invalid month" } }
```

| Status | Code                | Meaning                          |
| :----- | :------------------ | :------------------------------- |
| `400`  | `invalid_parameter` | A query parameter is malformed   |
| `404`  | `not_found`         | The league or player is unknown  |
| `500`  | `internal_error`    | Unexpected server failure        |
| `503`  | `unavailable`       | The database can't be reached    |

Every route sends `Access-Control-Allow-Origin` and answers `OPTIONS` preflight requests with `204`.

## `GET /api/health`

Checks that the Worker and the D1 database are reachable.

**Returns** `200`:

```json
{ "status": "ok", "db": "ok" }
```

Returns `503` with `{ "status": "error", "db": "error" }` if the database check fails.

## `GET /api/events`

Lists events, including occurrences of weekly events. Excluded dates are left out.

**Query parameters**

| Parameter  | Type                                   | Description                       |
| :--------- | :------------------------------------- | :-------------------------------- |
| `leagueId` | integer                                | Only events from this league      |
| `day`      | `YYYY-MM-DD`                           | Only events on this day           |
| `month`    | `YYYY-MM`                              | Only events in this month         |
| `year`     | `YYYY`                                 | Only events in this year          |
| `groupBy`  | `league` \| `day` \| `month` \| `year` | Group the events by this key      |

**Returns** `200`:

```json
{ "events": [Event] }
```

With `groupBy`, events are keyed by the group value:

```json
{ "events": { "2026-11-21": [Event] } }
```

**Event**

| Property           | Type             | Description                                          |
| :----------------- | :--------------- | :--------------------------------------------------- |
| `id`               | number \| string | Event ID. Weekly occurrences use a string ID          |
| `name`             | string           | Event name                                           |
| `date`             | string           | `YYYY-MM-DD`                                         |
| `startTime`        | string?          | `HH:MM`                                              |
| `leagueId`         | number           | ID of the hosting league                             |
| `eventType`        | string           | Category, such as `CHALLENGE`, `CUP` or `LEAGUE`     |
| `game`             | string           | `TCG`, `VGC`, `GO` or `ALL`                          |
| `ticketLink`       | string?          | Ticket URL                                           |
| `description`      | string?          | Free-text description                                |
| `prizes`           | string?          | Prize details                                        |
| `entryFee`         | string?          | Entry fee as text                                    |
| `isRecurring`      | boolean          | `true` for occurrences of a weekly event             |
| `recurringEventId` | number?          | ID of the weekly event an occurrence comes from      |

**Errors:** `400` for an invalid date or `groupBy`, `404` for an unknown `leagueId`.

## `GET /api/leagues`

Lists every league.

**Returns** `200`:

```json
{ "leagues": [League] }
```

**League**

| Property               | Type    | Description                                 |
| :--------------------- | :------ | :------------------------------------------ |
| `leagueId`             | number  | League ID                                   |
| `name`                 | string  | League name                                 |
| `location`             | string? | Address or area                             |
| `latitude`             | number? | Map latitude                                |
| `longitude`            | number? | Map longitude                               |
| `directions`           | string? | How to get there                            |
| `accessibility`        | string? | Accessibility information                   |
| `logo`                 | string? | Logo URL                                    |
| `brandColor`           | string? | Brand colour                                |
| `website`              | string? | Website URL                                 |
| `socialLink`           | string? | Social media URL                            |
| `eventLink`            | string? | Event listing URL                           |
| `webLink`              | string? | Additional web URL                          |
| `isChampionshipSeries` | boolean | `true` for the Championship Series league   |

## `GET /api/rankings`

Lists the National Rankings: Welsh players ordered by Championship Points.

**Query parameters**

| Parameter    | Type    | Description                                     |
| :----------- | :------ | :---------------------------------------------- |
| `season`     | `YYYY`  | Season to return. Defaults to the current season |
| `playerId`   | integer | Only this player                                |
| `playerName` | string  | Only players whose name matches                 |

**Returns** `200`:

```json
{ "season": 2027, "rankings": [Ranking] }
```

**Ranking**

| Property   | Type   | Description                         |
| :--------- | :----- | :---------------------------------- |
| `position` | number | Rank, starting at 1                 |
| `name`     | string | Player name                         |
| `cp`       | number | Championship Points for the season  |

**Errors:** `400` for an invalid `season`, `404` for an unknown player.
