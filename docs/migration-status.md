# Migration status

What still needs doing before the new app replaces the old stack.
Updated on 2026-11-19 from a read of the code, plus `npm run typecheck`,
`biome lint` and `npm run build`. The app was not run, and the queries have
not yet run against the migrated D1 data.

The new TanStack Start app is at the repo root (`src/`, `migrations/`). The old
FastAPI backend and React frontend are in `deprecated/backend/` and
`deprecated/frontend/`, kept for reference while they are ported.

## Already in place

- The four routes (`/`, `/leagues`, `/rankings`, `/admin`) with search-param
  handling, page titles and loaders.
- Clerk sign-in, the `/admin` redirect for signed-out users, and
  `authMiddleware` for server functions.
- The D1 schema (`src/db/schema.ts`) with three tables: `leagues`, `events`
  and `players`. The migrations are in `migrations/`, and
  `events` has a `pokedataGuid` column.
- The ported UI: calendar, event cards, leagues selector and map,
  national rankings, admin modals, header, footer, mobile nav and the 3D "today" marker.
- The settings context, the stylesheet, and the `public/` folder with the
  favicon, `robots.txt` and `sitemap.xml`.
- Real D1 queries for the four read functions:
  - `getLeagues` returns leagues.
  - `getSchedule` and `getAdminData` return one month of events, expanding
    weekly events and honouring `excludedDates`. The admin version keeps
    excluded occurrences, flagged.
  - `getRankings` returns players ranked by Championship Points.
- **Production data.** `scripts/supabase-to-d1.mjs` exports Supabase and writes
  `.supabase-export/import.sql` (gitignored). It turns each weekly event into
  an `events` row with `isRecurring = 1` and keeps the pokedata GUID in
  `pokedataGuid`. The import is a full replace, so it is safe to run again.
- The Cloudflare environment variables, and CI (lint, typecheck and build from
  the repo root).
- **Admin write operations** (merged in #229). `admin.functions.ts` has
  `handleLeagueSubmit`, `handleDeleteLeague`, `handleEventSubmit`,
  `handleDeleteEvent`, `handleExcludeEvent`, `handleUnexcludeEvent` and
  `handleNationalRankingsSubmit`, each a `createServerFn` behind
  `authMiddleware`. `admin.tsx` calls `router.invalidate()` after a write.
  They have not been run against real data.
- Lint and build pass. Typecheck has one error left (see step 2).

## Needed for the MVP

### 1. Admin access rule

`src/features/auth/auth.middleware.ts` only checks that someone is signed in.
`docs/CONTEXT.md` says admin access is for organisers only and there are no
public accounts. Pick one:

- Turn off sign-ups in the Clerk dashboard and invite admins by hand.
- Check a Clerk role or allowlist in the middleware.

Settle this first. The write functions now exist, so anyone who can sign in
can change data.

### 2. Typecheck error

One error remains: `src/db/client.server.ts` has an unused
`@ts-expect-error` on the `cloudflare:workers` import, because the module's
types now resolve. Remove the directive.

### 3. Green CI

CI should pass once step 2 is done. It is the bar for the MVP.

### 4. End-to-end check and deploy

- Load the import into the local database
  (`wrangler d1 execute playsouthwales --local --file=.supabase-export/import.sql`),
  run `npm run dev`, and click through every page and admin action. This is the first real test of
  the write functions, including excluding and restoring weekly occurrences.
- Run `npm run db:migrate:remote` and `npm run deploy`, set
  `CLERK_SECRET_KEY` with `wrangler secret put`, and point
  `playsouthwales.uk` at the Worker.

## Worth doing at the same time

- **Schedule sort.** `sortEventsForSchedule` in `src/lib/event-types.ts` now
  compares `date` and `startTime` separately, which should fix the old
  whole-string comparison. Confirm that `date` never carries a time, and cover
  it with a test.
- **Malformed dates.** A weekly event with a malformed start date produces no
  occurrences, with no warning.
- **Tests.** The recurrence and sort logic has none. Port
  `deprecated/frontend/tests/event-sort.test.mjs` and
  `event-descriptions.test.mjs` to Vitest.
- **Development seed.** There is none. Write a small SQLite seed outside
  `migrations/`, with dates relative to today, so contributors can see the
  calendar working without production data.

## Can wait until after launch

- The scrapers and hourly scheduler (`deprecated/backend/app/web/`,
  `scheduler.py`). They need Cloudflare Cron Triggers, and `wrangler.jsonc`
  has none. The sync should match events on `pokedataGuid`.
- The Discord bot announcements and the Sunday digest.
- Set legality and regulation markers on the calendar (`sets.json`,
  `regs.json`).
- Analytics and the API index endpoint.
- Season filtering in `getRankings`. It accepts a season but ignores it,
  because only the current season is stored.
- Porting the old Python and Playwright tests.

## Suggested order

1. Admin access rule (1), then the typecheck error (2), so CI is green (3).
2. Add tests for the schedule sort and recurrence logic.
3. End-to-end check against the imported data, then deploy (4).
4. Delete `deprecated/` once nothing in it is still needed for reference.
