# Migration status

What still needs doing before the new app replaces the old stack.

## Missing features

- TCG set and VGC regulation markers (`useSetLegality`, `useRegs`).

- `useTop20Players` and the `/players/top20` call have no replacement. The
  standings leaderboard was removed on purpose, but check whether the Top 20
  view should go too.

- The scrapers and hourly scheduler. They need Cloudflare Cron Triggers, and `wrangler.jsonc`
  has none. The sync should match events on `pokedataGuid`.

- The Discord bot announcements and the Sunday digest. Use the Discord REST
  API or a webhook with `fetch`.

- Analytics and the API index endpoint. Add TanStack Start server routes under `src/routes/api/`.


## Bugs

- `sortEventsForSchedule` in `src/lib/event-types.ts` now
  compares `date` and `startTime` separately, which should fix the old
  whole-string comparison. Confirm that `date` never carries a time, and cover
  it with a test.

- A weekly event with a malformed start date produces no
  occurrences, with no warning.

- Season filtering in `getRankings`. It accepts a season but ignores it,
  because only the current season is stored.
