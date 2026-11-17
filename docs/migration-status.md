# Migration status

What still needs doing before the new app in `update/` replaces the old stack.
Updated on 2026-11-17 from a read of the code and a `tsc` run. The app was not
run, and the new database queries have not run against a real D1 database.

The old FastAPI and React code now lives in `backend/`, `frontend/` and
`supabase/`. The new TanStack Start app lives in `update/`.

## Already in place

- The four routes (`/`, `/leagues`, `/rankings`, `/admin`) with search-param
  handling, page titles and loaders.
- Clerk sign-in, the `/admin` redirect for signed-out users, and an auth check
  for server functions.
- The D1 schema and two migrations (leagues, events, leaderboards, players).
- The ported UI: calendar, event cards, leagues selector and map, leaderboard,
  admin modals, header, footer, mobile nav and the 3D "today" marker.
- The settings context, the stylesheet, and the `public/` folder with the
  favicon, `robots.txt` and `sitemap.xml`.
- The dependencies and environment variables for icons and Google Maps.
- Real D1 queries for the four read functions (pull request 215):
  - `getLeagues` returns leagues with a `hasStandings` flag.
  - `getSchedule` and `getAdminData` return one month of events, expanding
    weekly events and honouring `excludedDates`. The admin version keeps
    excluded occurrences, flagged.
  - `getRankings` returns players ranked by Championship Points.
- The event type labels, taken from the old `EVENT_TYPE_MAP` constant.

## Needed before launch

### 1. Admin access rule

The server-side check only requires a signed-in user. Unless you restrict
sign-up in the Clerk dashboard, anyone who registers could edit data once the
write functions exist. Decide this before you build the writes.

### 2. Admin write operations

None exist. `update/src/routes/_authed/admin.tsx` calls eight handlers that
don't exist, and they cause every remaining type error:

- `handleLeagueSubmit`, `handleDeleteLeague`
- `handleEventSubmit`, `handleDeleteEvent`
- `handleExcludeEvent`, `handleUnexcludeEvent`
- `handleLeaderboardSubmit`, `handleNationalRankingsSubmit`

Each needs a server function behind `authMiddleware`. Port the behaviour from
`backend/app/routers/protected.py` and the services it calls:

- Create, update and delete leagues and events.
- Exclude or restore one occurrence of a weekly event.
- Replace a league's standings.
- Replace the top 20 list.

Occurrence ids are now strings like `3:2026-11-18`. Use `recurringEventId` to
find the series, and do not decode the id.

### 3. Data

The D1 database is empty, and `update/migrations/seed.sql` does not work. It is
the Postgres seed file copied unchanged, so it uses `TRUNCATE`, `::jsonb` and
a `weekly_events` table that no longer exists.

- **Development:** write a SQLite seed outside `migrations/`, because wrangler
  applies every `.sql` file in that folder. Use dates relative to today so the
  calendar always shows events.
- **Production:** import the leagues, events, weekly events and players from
  Supabase. Convert each weekly event into an `events` row with
  `isRecurring = 1`.

### 4. Known gaps in the read queries

- `getRankings` accepts a season but ignores it. Only the current season exists.
- A weekly event with a malformed start date produces no occurrences, with no
  warning.
- The schedule sort compares full date strings. A date that includes a time
  sorts before one that doesn't, so type order breaks on that day.
- The recurrence and sort logic has no tests.

## Can wait until after launch

- The scrapers and hourly scheduler (`backend/app/web/pokedata.py`,
  `championship_series.py`, `scheduler.py`). They need Cloudflare Cron
  Triggers, and `wrangler.jsonc` has none.
- The Discord bot announcements and weekly digest.
- Set legality and regulation markers on the calendar (`sets.json`,
  `regs.json`).
- Vercel analytics and the API index endpoint.
- The old Python and Playwright tests.
- CI. `.github/workflows/ci.yml` runs its npm scripts from the repo root. Check
  that it covers `update/`, and expect typecheck to fail until step 2 is done.

## Suggested order

1. Admin access rule (1), then admin writes (2).
2. Development seed (3), so you can see the pages working.
3. Production data import (3).
4. Fix the read query gaps (4).
