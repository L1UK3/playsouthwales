# Migration status

What still needs porting from `deprecated/` and wiring up before the new app is
a minimum viable product. Written on 2026-11-14 from a read of the code; the
app was not run.

The new app currently has routes, loaders, auth and a database schema, but no
ported UI components and no real database queries, so every page loads empty
data and then fails on missing components.

## Already in place

- The four routes (`/`, `/leagues`, `/rankings`, `/admin`) with URL
  search-param handling, page titles and loaders.
- Clerk sign-in, the `/admin` redirect for signed-out users, and an auth check
  for server functions.
- The D1 schema and two migrations (leagues, events, leaderboards, players).
- The stylesheet (`src/styles.css` is the old `global.css` ported), plus month,
  filter and grouping helpers.

## Needed for a minimum viable product

### 1. Real database queries

All four server functions return empty arrays:

- `getSchedule` in `src/features/schedule/schedule.functions.ts`
- `getLeagues` in `src/features/leagues/leagues.functions.ts`
- `getRankings` in `src/features/rankings/rankings.functions.ts`
- `getAdminData` in `src/features/admin/admin.functions.ts`

The logic to port is in `deprecated/backend/app/services/` (`event.py`,
`league.py`, `leaderboard.py`, `event_hierarchy.py`). The main piece of real
logic is expanding recurring weekly events into dated occurrences and honouring
`excludedDates`.

### 2. Admin write operations

None exist yet. `src/routes/_authed/admin.tsx` calls handlers that aren't
defined:

- `handleLeagueSubmit`, `handleDeleteLeague`
- `handleEventSubmit`, `handleDeleteEvent`
- `handleExcludeEvent`, `handleUnexcludeEvent`
- `handleLeaderboardSubmit`, `handleNationalRankingsSubmit`

Each needs a server function covering what
`deprecated/backend/app/routers/protected.py` did: create, update and delete
for leagues and events, replace a league's standings, and replace the top-20
list.

### 3. UI components

These account for the 24 errors from `npm run typecheck`. All live under
`deprecated/frontend/src/features/`.

| Page | Components to port |
| --- | --- |
| Schedule | `NavBar`, `Filters`, `CalendarView` (with `Cell`), `SelectedDaySection`, `ListView` (with `ListEventGroup`), and the `event-card` feature they render |
| Leagues | `LeagueSelector` (with `LeagueCard`, `LeagueInfo`), `LeagueMap` and its markers, info box and mobile sheet |
| Rankings | `Leaderboard` (with podium, `RankBadge`, `SkeletonRow`) |
| Admin | `LeagueFormModal`, `EventFormModal`, `LeaderboardFormModal`, `NationalRankingsModal` |

### 4. Site layout

The root layout is only a sign-in button. `Header.tsx`, `Footer.tsx` and
`MobileNavBar.tsx` aren't ported, so there is no navigation between pages.

### 5. Missing dependencies and config

- `lucide-react` (icons, e.g. `Trophy`) and `@vis.gl/react-google-maps` are not
  in `package.json`.
- `VITE_GOOGLE_MAPS_API_KEY` and `VITE_GOOGLE_MAPS_MAP_ID` are not in
  `.env.example`.
- There is no `public/` folder, so the favicon, `robots.txt` and `sitemap.xml`
  are missing.

### 6. Data

The D1 database is empty. The existing leagues, events, weekly events and
leaderboards need moving from Supabase (`deprecated/supabase/seed.sql` shows
the shape). The old schema had a separate `weekly_events` table; the new one
folds it into `events.isRecurring`, so the import needs a small transform.

### 7. Event type labels

The pages expect a `types` map (type code to display name) from the server.
Where the old app sourced it has not been traced, and there is no table for it
in the new schema.

### 8. Who counts as an admin

The server-side check only requires a signed-in user. Unless sign-up is
restricted in the Clerk dashboard, anyone who registers could edit data once
the write functions exist. Decide this before starting step 2.

## Suggested order

1. Database queries (1).
2. Components and layout for the three public pages (3 and 4).
3. Data import (6), so there is something to see.
4. Admin access rule (8), then admin writes (2).

## Can wait until after the MVP

- The scrapers and hourly/daily scheduler (`pokedata.py`,
  `championship_series.py`, `scheduler.py`), which would need Cloudflare Cron
  Triggers.
- The Discord bot announcements and weekly digest.
- Set legality and regulation markers on the calendar (`sets.json`,
  `regs.json`, `useRegs`, `useSetLegality`).
- The 3D "today" marker (`ActiveMarkerOverlay.tsx`, `three`).
- The dark/light settings context, Vercel analytics, the API index endpoint,
  and the old Python and Playwright tests.
