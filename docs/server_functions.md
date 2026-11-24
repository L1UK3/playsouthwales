# Admin server functions

Write-side server functions for the admin dashboard, ported from
`deprecated/backend/app/routers/protected.py` and
`deprecated/backend/app/services/{league,event}.py`.

Every function is a `createServerFn({ method: "POST" })` guarded by
`authMiddleware`, and every write goes through `src/db/queries.server.ts`.
The route (`src/routes/_authed/admin.tsx`) calls `router.invalidate()` after
each save so the loader re-reads the schedule.

```mermaid
classDiagram
    direction LR

    namespace AdminServerFunctions {
        class handleLeagueSubmit {
            <<createServerFn POST>>
            +input LeagueSubmitInput
            +Promise~void~
        }
        class handleDeleteLeague {
            <<createServerFn POST>>
            +input leagueId number
            +Promise~void~
        }
        class handleEventSubmit {
            <<createServerFn POST>>
            +input EventSubmitInput
            +Promise~void~
        }
        class handleDeleteEvent {
            <<createServerFn POST>>
            +input id EventId
            +Promise~void~
        }
        class handleExcludeEvent {
            <<createServerFn POST>>
            +input id EventId
            +Promise~void~
        }
        class handleUnexcludeEvent {
            <<createServerFn POST>>
            +input id EventId
            +Promise~void~
        }
    }

    class AuthMiddleware {
        <<middleware>>
        +authMiddleware() userId
    }

    class QueriesServer {
        <<src/db/queries.server.ts>>
        +findLeague(id) League
        +insertLeague(values) void
        +updateLeague(id, values) boolean
        +deleteLeague(id) void
        +findEvent(id) ScheduleEvent
        +insertEvent(values) void
        +updateEvent(id, values) boolean
        +deleteEvent(id) void
        +setExcludedDates(id, dates) void
    }

    class Schema {
        <<src/db/schema.ts>>
        leagues
        events
        players
    }

    class AdminRoute {
        <<src/routes/_authed/admin.tsx>>
        +save() router.invalidate()
    }

    AdminRoute ..> handleLeagueSubmit : calls
    AdminRoute ..> handleDeleteLeague : calls
    AdminRoute ..> handleEventSubmit : calls
    AdminRoute ..> handleDeleteEvent : calls
    AdminRoute ..> handleExcludeEvent : calls
    AdminRoute ..> handleUnexcludeEvent : calls

    handleLeagueSubmit ..> AuthMiddleware : guarded by
    handleDeleteLeague ..> AuthMiddleware : guarded by
    handleEventSubmit ..> AuthMiddleware : guarded by
    handleDeleteEvent ..> AuthMiddleware : guarded by
    handleExcludeEvent ..> AuthMiddleware : guarded by
    handleUnexcludeEvent ..> AuthMiddleware : guarded by

    handleLeagueSubmit ..> QueriesServer : findLeague, insertLeague, updateLeague
    handleDeleteLeague ..> QueriesServer : findLeague, deleteLeague
    handleEventSubmit ..> QueriesServer : insertEvent, updateEvent
    handleDeleteEvent ..> QueriesServer : deleteEvent
    handleExcludeEvent ..> QueriesServer : findEvent, setExcludedDates
    handleUnexcludeEvent ..> QueriesServer : findEvent, setExcludedDates

    QueriesServer ..> Schema : drizzle
```

## Input types

```mermaid
classDiagram
    class LeagueSubmitInput {
        +leagueId? number
        +name string
        +location? string
        +latitude? number
        +longitude? number
        +brandColor? string
        +logo? string
        +website? string
        +eventLink? string
        +socialLink? string
        +directions? string
        +accessibility? string
        +isChampionshipSeries boolean
    }

    class EventSubmitInput {
        +id? EventId
        +leagueId number
        +name string
        +date string
        +startTime? string
        +eventType string
        +game string
        +ticketLink? string
        +description? string
        +prizes? string
        +entryFee? string
        +isRecurring boolean
    }

    class EventId {
        <<number | string>>
        one-off: 42
        occurrence of series 42: "42:2026-11-05"
    }

    EventSubmitInput --> EventId : id
```

## Behaviour (ported from the deprecated backend)

| Function | Legacy source | Behaviour |
| --- | --- | --- |
| `handleLeagueSubmit` | `create_league` / `patch_league` | No `leagueId`: insert. With `leagueId`: update, `not found` if the row is missing. |
| `handleDeleteLeague` | `delete_league` | `not found` if missing. Refuses championship series. Deletes the league's events, then the league, in one batch. |
| `handleEventSubmit` | `create_event` / `patch_event` | No `id`: insert (`isRecurring` picks one-off or series). With `id`: update the row. `isRecurring` and `excludedDates` are not changed on update. |
| `handleDeleteEvent` | `delete_event` | One-off id: delete the row. Occurrence id: delete the whole series. |
| `handleExcludeEvent` | `delete_event` with `excludeDate` | Occurrence id only. Adds the occurrence date to the series' `excludedDates`. Idempotent. |
| `handleUnexcludeEvent` | none in legacy | Occurrence id only. Removes the date from `excludedDates`. Added because the admin list exposes an "unexclude" action. |
