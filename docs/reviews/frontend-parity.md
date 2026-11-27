# Frontend parity: TanStack Start app (`main`) vs original app (`deprecated`)

Compared: `main` at `3012492` and `deprecated` at `c508989` (React + Vite SPA in
`frontend/`, FastAPI in `backend/`).

Method: two independent reviewers read both codebases in opposite orders, one
starting from the new app and one from the original. Their findings were
reconciled, and the points where they disagreed were checked in the code. Paths
starting `O:` are in `deprecated/frontend/src`; paths starting `N:` are in
`main/src`.

The plan this report supports: point the root domain at the new app, and keep
the FastAPI app running for the features that have not been ported yet.

## 1. Summary

The new app matches the original for most of what a visitor sees: the
schedule, the event cards, the filters, the desktop leagues map, rankings,
the header and nav, and the admin forms. It also adds URL state, server-side
rendering, error and 404 pages, and a server-side admin guard.

What still blocks a seamless switch is mostly at the edges, not in the pages:

1. **Old URLs break.** `/schedule` (the old canonical schedule URL) and `/api/*`
   return 404 on the new app.
2. **Two databases.** The old app reads and writes Supabase; the new app reads
   D1. While both run, edits and scraper updates on one do not appear on the
   other.
3. **Data that nothing fills.** The set and regulation markers render, but no
   rows exist to show. National Rankings have no editor and no championship
   points sync.
4. **Admin safety.** Delete, exclude and restore run on one click, with no
   confirmation.
5. **Mobile leagues page.** The mobile map sheets are ported, but no page
   renders them.

## 2. Feature comparison

Status values: **parity**, **partial**, **missing**, **new-only**, and
**dropped** (removed on purpose, with a source cited).

### Shell and navigation

| Feature | Original | New | Status | Notes |
| --- | --- | --- | --- | --- |
| Schedule URL | `/schedule`; `/` redirects there (O: `routes/index.tsx`) | Schedule at `/` (N: `routes/index.tsx`); no `/schedule` route | partial | `/schedule` shows NotFound |
| Header tabs, section title, Sign In / UserButton / Admin, theme toggle | O: `layouts/Header.tsx` | N: `components/Header.tsx`, `nav.ts` | parity | Clerk `neobrutalism` appearance dropped |
| Mobile bottom nav | O: `components/MobileNavBar.tsx` | N: `components/MobileNavBar.tsx` | parity | |
| Footer (pokedata credit in the selected-day list) | O: `SelectedDaySection` | N: `SelectedDaySection.tsx` | parity | |
| Error and 404 pages | Router default | N: `components/RouteStatus.tsx` | new-only | HTTP status of NotFound not checked |

### Schedule and calendar

| Feature | Original | New | Status | Notes |
| --- | --- | --- | --- | --- |
| Month grid, prev/next/Today, calendar/list toggle with view transition | O: `pages/SchedulePage.tsx` | N: `routes/index.tsx`, `useScheduleNavigation.ts` | parity | |
| League, type and game filters with Clear | O: `Filters.tsx` | N: `Filters.tsx` | parity | |
| Today selected on first load | O: `SchedulePage.tsx` (`useState(getLocalDateString(new Date()))`) | `day` is undefined until a click (N: `features/schedule/search.ts`) | partial | First visit shows "No Date Selected" |
| Events in neighbouring-month padding cells | Loads the previous, current and next month | Loads the current month only (N: `db/events/queries.server.ts`) | partial | Padding cells are always empty |
| Weekly recurrence and excluded dates | Client side (O: `hooks/useEvents.ts`) | Server side (N: `lib/recurrence.ts`) | parity | |
| "+N more", today, selected and special-day borders, 3D active marker | O: `Cell.tsx`, `ActiveMarkerOverlay.tsx` | Same files | parity | Neither app honours `prefers-reduced-motion` |
| Set release, set legality and VGC regulation markers | `/api/sets`, `/api/regs`, served from `backend/app/data/*.json` | Read from D1 `sets` and `regs` (PR #264) | partial | UI done; nothing writes rows. `src/web/sets.ts` and `regs.ts` are empty |
| Marker labels | "Set Legal", "Set Release", "Reg Legal" (O: `constants/index.ts:62-64`) | "LEGAL", "NEW SET", "VGC REG" (N: `lib/event-types.ts:14-16`) | partial | Users will notice the wording change |
| Event cards: logo, Official tag, fee, prizes, directions, accessibility, tickets, default descriptions | O: `features/event-card/*` | N: `features/event-card/*` | parity | |
| Keyboard-operable day cells | No role or tabIndex | `role="button"`, Enter/Space | new-only | |
| Deep links (`month`, `day`, `view`, `league`, `type`, `game`) | None | N: `features/schedule/search.ts` | new-only | |

### Leagues and map

| Feature | Original | New | Status | Notes |
| --- | --- | --- | --- | --- |
| Desktop list beside a Google map, branded markers, info window, dark/light map style; Championship Series hidden | O: `pages/LeaguesPage.tsx` | N: `routes/leagues.tsx` | parity | |
| Mobile (<992px): full-screen map, "Leagues N" list sheet, league sheet with the next 3 events | O: `LeaguesPage.tsx` mobile branch, `MapSheet.tsx`, `LeagueSheet.tsx` | `MapSheet.tsx`, `LeagueSheet.tsx`, `useLeagueUpcomingEvents.ts` ported but not imported anywhere. Mobile gets a stacked list and a 60dvh map | missing | Largest mobile regression; tracked in #204 |
| Map unavailable state when the key is missing | O: `LeagueMap.tsx` | N: `LeagueMap.tsx` | parity | |
| `?league=` deep link | None | N: `leagues.tsx` | new-only | |

### Rankings

| Feature | Original | New | Status | Notes |
| --- | --- | --- | --- | --- |
| Banner, intro, podium, table, Top 20 cutoff row | O: `pages/RankingsPage.tsx` | N: `routes/rankings.tsx` | parity | |
| Season selector | Current season only (`backend/app/services/leaderboard.py:50`) | Current season only (N: `rankings.functions.ts`) | parity | Same limitation in both; #238 |
| Loading state | Skeleton rows | SSR loader and `RoutePending` | parity | Different mechanism |
| Championship points kept current | Hourly backend scheduler | `src/web/pokedata/championship_points.ts` is unused and does not typecheck on `web-services/champ-points` | missing | |

### Admin

| Feature | Original | New | Status | Notes |
| --- | --- | --- | --- | --- |
| Sign-in guard | Client side (O: `routes/admin.tsx`) | Server side (N: `_authed.tsx`, `authMiddleware`) | parity | Stronger in the new app |
| League create, edit and delete | O: `LeagueFormModal.tsx` | N: `LeagueFormModal.tsx`, `admin.functions.ts` | parity | |
| Event create and edit (weekly repeat), delete series, exclude and restore an occurrence | O: `AdminPage.tsx`, `ListCard.tsx` | N: `routes/_authed/admin.tsx` | parity | |
| Confirmation before delete, exclude and restore | `window.confirm`, including an "ENTIRE weekly series" warning (O: `AdminPage.tsx:266-345`) | None (no `confirm(` anywhere in N: `src`) | missing | One click deletes a whole series or a league |
| Edit National Rankings (Top 20) | O: `NationalRankingsModal.tsx`, `PUT /api/players/top20` | Removed; nothing writes D1 `players` | missing | `docs/review/functionality.md` calls the path unreachable, but it was reachable in the original |
| Edit standings (per-league leaderboard) | O: `LeaderboardFormModal.tsx` | None | dropped | `docs/migration-status.md`: "removed on purpose" |
| Save error feedback | `console.error` only | `window.alert` | new-only | |

### Cross-cutting

| Feature | Original | New | Status | Notes |
| --- | --- | --- | --- | --- |
| Per-page title and description | O: `hooks/useDocumentMetadata.ts` (client) | N: `lib/seo.ts` `pageMeta` (SSR) | parity | |
| Canonical link, `WebSite` JSON-LD, robots meta | O: `frontend/index.html` | None | missing | |
| Favicon | `<link rel="icon" href="/favicon.jpg">` | `public/favicon.jpg` exists, but nothing links to it | missing | |
| Manrope and Geist Mono web fonts | Google Fonts link in `index.html` | Not loaded; `styles.css` only names them | missing | Conflicts with the locked `docs/design.md` |
| Theme preference | Cookie `playwales-settings`, light by default | Same cookie and key, dark by default (PR #255); `<html className="dark">` hard-coded in N: `routes/__root.tsx` | partial | The saved preference carries over. Light-mode users likely see a dark flash, because the server does not read the cookie |
| Analytics | `@vercel/analytics` (O: `main.tsx`) | None | missing | Part of #235 |
| `robots.txt` | `Disallow: /` | `Disallow: /` | parity | Both block all indexing. Decide whether that is intended before launch |
| Devtools | n/a | `<TanStackDevtools>` rendered in `__root.tsx` | check | `@tanstack/devtools-vite` should strip it from builds; confirm in a production build |

## 3. URLs and the transition

| Old URL | New app | Recommended action |
| --- | --- | --- |
| `/` | Serves the schedule (it used to redirect) | None |
| `/schedule` | NotFound | 301 to `/`. It is in the old sitemap, nav and league sheet links |
| `/leagues`, `/rankings`, `/admin` | Same paths | None. The old app used no query parameters, so no existing deep links can break |
| `/events` | NotFound | 301 to `/`. The old Discord digest links to `https://www.playsouthwales.uk/events` (`backend/app/integrations/discord_bot.py:34`), which already 404s in the old SPA |
| `/api/*` | Not served | Proxy to `https://playsouthwales.onrender.com` (what `frontend/vercel.json` does today) until #235 ships. The planned shape in `docs/api.md` (`month=YYYY-MM`, `{events: [...]}`) is not backward compatible with the old one (`month` and `year` as integers, a bare array) |
| `www.` host | Unknown | Make sure Cloudflare redirects `www` to the apex. The bot uses `www.` |

If the old frontend moves to its own hostname to keep serving the unported
features:

- Add that hostname to `ALLOWED_ORIGINS` and `CLERK_AUTHORIZED_PARTIES`
  (`backend/app/config.py:20-31`, `auth.py:28`).
- Keep its `/api` rewrite.
- Check that the production Clerk instance accepts the new origin.

### The two-database problem

The old app and its scrapers read and write **Supabase**. The new app reads
**D1** (`wrangler.jsonc`). Until one of them is the single source of truth:

- events imported by the old scheduler do not reach the new site;
- schedule edits made in the new admin do not reach the old site or the old
  Discord bot;
- National Rankings can only be edited in the old admin, so the new site's
  rankings will not change.

Pick one of these before switching the domain:

- **Option A:** a scheduled one-way sync from Supabase to D1, with admin
  writes still made on the old app.
- **Option B:** make D1 the source of truth, port the writers (scrapers,
  rankings), and point the old bot at the new data.

Option A is the smaller step and keeps the old bot correct. While it runs,
point `/admin` on the new app at the old admin, or hide the new admin.

## 4. Data the new app still needs

| Feature | Needs | Old source |
| --- | --- | --- |
| Set and regulation markers | Rows in D1 `sets` and `regs` | `backend/app/data/sets.json`, `regs.json`, served by `GET /api/sets` and `/api/regs` |
| Neighbouring-month cells | Previous and next month in `querySchedule` | `GET /api/events?month&year` and `/api/weekly-events` |
| National Rankings updates | A writer for D1 `players` | `PUT /api/players/top20`, the hourly championship points sync |
| Fresh official events | Cron scrapers | `scheduler.py`, `POST /api/events/sync-pokedata`, `sync-championship` |
| Public JSON API | `src/routes/api/*` | `routers/public.py`, `api_index.py` |
| Mobile league sheet | Nothing new: `getSchedule` already provides it | n/a |

## 5. What to do next

### Existing tickets, in order

1. **#204** Leagues page with map. Only the mobile sheet is left: render
   `MapSheet` and `LeagueSheet` below 992px and pass `showInfoWindow={false}`.
   Size S/M.
2. **#250** Cloudflare cron jobs, then **#233** scrapers. These unblock fresh
   events, set and regulation data, and championship points. They are what
   eventually lets the old scheduler be retired.
3. **#235** API and analytics. Until it ships, use the `/api/*` proxy in the
   first proposed ticket below.
4. **#234** Discord port, then **#214**. Both can wait as long as the old bot
   keeps running.
5. **#231** Calendar markers. The UI is now on `main` through PR #267, so this
   issue can be closed. Filling the tables is proposed ticket 4 below.
6. **#238** Seasons. Low priority: the old app only had one season too.

### Proposed new tickets

Priority 1 means the ticket blocks the domain switch. Priority 2 tickets are
regressions users will notice. Priority 3 tickets are polish.

| # | Priority | Size | Title | Scope |
| --- | --- | --- | --- | --- |
| 1 | 1 | S | Redirect legacy URLs and proxy `/api/*` to FastAPI | 301 `/schedule` and `/events` to `/`. Proxy `/api/*` to onrender until #235. Redirect `www` to the apex |
| 2 | 1 | M | Choose the source of truth while both apps run | Supabase-to-D1 sync (option A) or D1 writers (option B). Decide what `/admin` does in the meantime |
| 3 | 1 | S | Confirm destructive admin actions | Restore the confirmations for delete league, delete series, exclude and restore, including the whole-series warning |
| 4 | 2 | S | Load set and regulation data into D1 | One-off load from `backend/app/data/*.json`, by migration or `wrangler d1 execute`, until the #233 scrapers exist |
| 5 | 2 | M | Restore National Rankings updates | Port the Top 20 editor or a championship points sync writing D1 `players`. Link to the old admin until then |
| 6 | 2 | S | Select today on first schedule load | Default `day` to today when the URL has no `day` and no `month` |
| 7 | 2 | S | Show neighbouring-month events in padding cells | Extend `querySchedule` to the visible grid range |
| 8 | 2 | S | Load web fonts and link the favicon | Manrope and Geist Mono, and `<link rel="icon">`, in the root `head` |
| 9 | 2 | S | Apply the theme cookie on the server | Read `playwales-settings` in SSR to set `<html class>` and avoid the dark flash. Keep dark as the default (#255). Related: #189 |
| 10 | 3 | S | Restore canonical link and JSON-LD, and decide on `robots.txt` | Add to `pageMeta`. Both apps currently block all crawlers |
| 11 | 3 | S | Agree date-marker labels | "LEGAL / NEW SET / VGC REG" versus the old "Set Legal / Set Release / Reg Legal" |
| 12 | 3 | S | Check the production build | Devtools stripped, NotFound returns 404, Clerk appearance (`neobrutalism` dropped) |

### Suggested order for the domain switch

1. **Before switching:** proposed tickets 1, 2 and 3.
2. **Soon after:** #204 and proposed tickets 4, 6, 7, 8 and 9.
3. **Through the migration:** #250, then #233, then proposed ticket 5,
   while keeping the old scheduler and bot running.
4. **Retire FastAPI:** once #235, #234 and #214 are done and nothing calls
   onrender.

## 6. Not verified

- Whether production D1 already has rows in `sets`, `regs` or `players`.
- The HTTP status of the new NotFound page, and whether devtools are stripped
  in production. Neither app was run.
- What else links to `/schedule` or `/api/*`, apart from the Discord bot.
- Whether Clerk production accepts the old frontend on a new hostname.
- `docs/server_functions.md` cites `deprecated/backend/...` paths that do
  not exist on `main`. Those files are only on the `deprecated` branch.
