# Functionality review: admin write server functions

Scope: `git diff main...feat/admin` (admin write server functions, their
queries in `src/db/queries.server.ts`, and the wiring in
`src/routes/_authed/admin.tsx`). Review run at high effort with the
`code-review` skill, dedup only, no verification pass.

Findings are ordered most severe first.

| # | Severity | File:line | Category | Finding |
| --- | --- | --- | --- | --- |
| 1 | Critical | `src/db/queries.server.ts:27` | correctness | `queryLeagues` reads `leaderboards`, which the schema no longer defines. Every `querySchedule` call throws, so the admin page cannot load. |
| 2 | High | `src/routes/_authed/admin.tsx:79` | correctness | `commit()` has no error handling. Failed league and event saves reject silently and leave the modal open with no message. |
| 3 | High | `src/db/queries.server.ts:172` | correctness | Duplicate player names in one rankings submit insert the same name twice and violate `UNIQUE(name)`, so the whole batch fails. |
| 4 | High | `src/features/admin/admin.functions.ts:142` | correctness | Editing one occurrence writes the form's `date` and fields onto the series template, shifting or dropping earlier occurrences. |
| 5 | Medium | `src/features/admin/admin.functions.ts:137` | correctness | Editing an event ignores a changed `isRecurring` flag without any error. |
| 6 | Medium | `src/features/admin/admin.functions.ts:74` | correctness | Validators check only `name`. Invalid dates, `leagueId` 0 and `NaN` coordinates are stored. |
| 7 | Medium | `src/features/admin/admin.functions.ts:156` | correctness | Deleting an occurrence deletes the whole series with no warning. Matches the legacy API. |
| 8 | Medium | `src/db/queries.server.ts:41` | correctness | Exclude and unexclude are read-modify-write. Concurrent exclusions can overwrite each other. |
| 9 | Low | `src/features/admin/admin.functions.ts:209` | simplification | Redundant `?? 0` in the rankings normaliser. The `playerId` and `cp` coercions could share one helper. |

## Details

### 1. `queryLeagues` uses a table that no longer exists (critical)

`src/db/queries.server.ts:13` imports `leaderboards` from `./schema`, but the
schema has no such export. `tsc` reports TS2305. At runtime the import is
`undefined`, so `db.select(...).from(undefined)` throws. `querySchedule` calls
`queryLeagues`, so both the public schedule and `getAdminData` fail. This
predates the admin work, but the admin page cannot load until it is fixed.

### 2. Failed saves are silent

`commit` in `src/routes/_authed/admin.tsx` awaits the action and only then
closes the modal and invalidates. If the action throws, the rejection reaches
`LeagueFormModal` and `EventFormModal`, which ignore the returned promise. The
modal stays open and the user gets no message. `NationalRankingsModal` is the
only caller that catches the error.

### 3. Duplicate names break the rankings save

`replacePlayers` builds one insert per incoming row. Duplicate names in the
submission produce two inserts for a name that is not yet stored. The second
violates `UNIQUE(name)` and the batch rolls back. Legacy `update_top20`
collapsed duplicates by name, last one wins.

### 4. Editing an occurrence rewrites the series

`handleEventSubmit` with an occurrence id calls `updateEvent(rowId, values)`,
and `values` includes the form's `date`. The template date becomes the edited
occurrence's date, and `expandRecurring` starts from the template date, so
earlier occurrences disappear. Legacy `patch_event` had the same effect, but
the admin UI presents it as a single-occurrence edit.

### 5. `isRecurring` changes are dropped on edit

The form lets the admin toggle `isRecurring`, but the update path never writes
it. Legacy `patch_event` also popped it. The save succeeds and nothing changes.

### 6. Weak validation

Only `name` is checked. Invalid `date` strings reach `expandRecurring`, which
slices them. `leagueId` 0 (sent when no league is selected) is inserted
without an existence check. `parseFloat` on bad input in `LeagueFormModal`
produces `NaN` latitude or longitude, which is stored.

### 7. Occurrence delete removes the series

Deleting an occurrence removes the template row, so every occurrence goes.
Legacy `delete_event` did the same. The admin list places this next to the
per-occurrence exclude action, so it is easy to hit by mistake.

### 8. Exclusion is not atomic

`setOccurrenceExcluded` reads `excludedDates`, computes the new array and
writes it back. Two concurrent exclusions on the same series can lose one
change. A single SQL `json_insert` or `json_remove` update would avoid this.

### 9. Rankings normaliser

`Number.isFinite(player.playerId) ? Math.trunc(player.playerId ?? 0) : 0`
repeats the `cp` line. The `?? 0` is only there for the type checker. One
helper for both fields would be simpler.

## Not in the diff, noted during review

- `src/features/admin/index.ts:2` still re-exports `LeaderboardFormModal`,
  whose file was deleted in `d3ad0485`. This breaks `tsc` and any build that
  imports the barrel.
- `src/db/client.server.ts:1` has an unused `@ts-expect-error` (TS2578).
