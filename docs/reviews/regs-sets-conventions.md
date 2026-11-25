# Review: shared conventions for `feat/regs` and `feat/sets`

Scope: `git diff feat/web-services...feat/regs` and
`git diff feat/web-services...feat/sets`. The two branches were built in
parallel from one brief and port PR #264 (calendar date markers, issue #231).
Both pass typecheck, lint, format and tests, and both migrate and seed a local
D1. This review lists where they drifted apart, and gives one target convention
for each item so the branches read as one feature.

How to use this file: work through the table in order. Each row says which
branch changes and what the code should look like afterwards. Make one small
commit per row, on the branch named, with a short conventional message. Rows
marked **both** need the same edit on each branch. After the last row, run
`npm run typecheck`, `npm run format`, `npm run lint` and `npm test` on each
branch.

## Summary

| # | Branch | File | Change |
| --- | --- | --- | --- |
| 1 | regs | `src/db/regs/markers.ts` | Marker id prefix `reg-` → `regulation-`, to match `release-` / `legality-` |
| 2 | sets | `src/db/sets/markers.ts` | Month test `startsWith(month)` → `startsWith(\`${month}-\`)` |
| 3 | sets | `src/db/sets/markers.ts` | Replace the `for` / `push` loop with `flatMap`, the same shape as `toRegMarkers` |
| 4 | both | `src/db/*/markers.ts` | Drop `startTime: ""` and `entryFee: ""` |
| 5 | both | `src/db/*/markers.ts` | Drop the hard-coded `description` and rely on `getEventDescription` defaults |
| 6 | both | `src/db/*/queries.server.ts` | Give every exported function a one-line JSDoc in the same voice |
| 7 | both | `src/db/*/queries.server.ts` | Remove the unused no-month branch and `insertReg` / `insertSet` |
| 8 | both | `scripts/seed-d1.mjs` | Number the seed sections 4 (sets) and 5 (regs), and update the header comment |
| 9 | both | `tests/*-markers.test.ts` | One test layout: `make<Row>` factory, full-shape `deepEqual`, same `describe` names |
| 10 | merge | `src/db/events/queries.server.ts` and others | How to resolve the three known conflicts when the branches meet |
| 11 | merge | `migrations/` | Generate the merge migration after both branches land |

## Details

### 1. Marker id prefix (regs)

Sets builds ids from the lower-cased event type: `release-ME6`,
`legality-ME6`. Regs uses `reg-regulation-h`, which matches neither its event
type (`REGULATION`) nor the sets pattern. Target convention:
`${eventType.toLowerCase()}-${key}`, where the key is the set `code` or the
slugged regulation `name`.

```ts
id: `regulation-${slug(reg.name)}`,
```

Update `tests/reg-markers.test.ts` to match (`"regulation-regulation-h"`).
Nothing outside these files reads the ids.

### 2. Month test (sets)

`toRegMarkers` checks `date.startsWith(\`${month}-\`)`. `toSetMarkers` checks
`startsWith(month)`, which would also match a malformed month such as
`"2026-1"` against `"2026-11-06"`. Use the stricter regs form in both.

### 3. Marker builder shape (sets)

`toRegMarkers` is a `filter` → `map` pipeline. `toSetMarkers` builds an array
with a `for` loop and two `if` blocks that repeat seven fields. Target: one
`flatMap` over rows that returns zero, one or two markers, with the shared
fields built once.

```ts
export function toSetMarkers(rows: SetRow[], month: string): ScheduleEvent[] {
	const inMonth = (date: string) => date.startsWith(`${month}-`);
	return rows.flatMap((set) =>
		(
			[
				["RELEASE", set.releaseDate],
				["LEGALITY", set.legalDate],
			] as const
		)
			.filter(([, date]) => inMonth(date))
			.map(([eventType, date]) => ({
				id: `${eventType.toLowerCase()}-${set.code}`,
				name: set.name,
				date,
				leagueId: -1,
				eventType,
				game: "TCG",
			})),
	);
}
```

Keep the order release first, then legality. The existing test
`builds markers for every set, keyed by set code` checks it.

### 4. Empty optional fields (both)

`startTime`, `description` and `entryFee` are nullable columns in
`src/db/events/schema.ts`, so they are optional on `ScheduleEvent`. Both
builders set `startTime: ""` and `entryFee: ""`, copied from the PR. Leave
them out. The calendar and schedule cards take the `isDateMarker` branch for
these event types and do not render time or fee. Before you commit, check
`CalendarCard`, `ScheduleCard` and `ListCard` in
`src/features/event-card/components/` for any `startTime` or `entryFee` read
that is not behind `isDateMarker`.

### 5. Descriptions (both)

`src/features/event-card/utils/getEventDescription.ts` already holds default
copy for `LEGALITY`, `RELEASE` and `REGULATION`, and uses it whenever
`description` is blank. The builders add a second, different source of
marker text (for example "Official English release date for …"). Choose one:

- **Preferred:** drop `description` from both builders, so the defaults apply.
- If set-specific text is wanted, move it into `getEventDescription` (for
  example as a function of the event) rather than into the db layer.

Update the full-shape assertions in `tests/set-markers.test.ts`.

### 6. JSDoc (both)

| Function | regs | sets |
| --- | --- | --- |
| `toXMarkers` | "Turns regulation rows into VGC date markers for the given month." | "The calendar date markers for `month`: …" |
| `queryX` | yes | yes |
| `queryXMarkers` | none | yes |
| `insertX` | none | none |

Target: every exported function gets one line in the noun-phrase voice used in
`src/db/utils.ts` and `scripts/lib/d1-sql.mjs`, naming the month as
`` `month` (YYYY-MM) ``. For example:

- `/** The VGC regulation date markers for \`month\` (YYYY-MM). */`
- `/** The TCG set release and legality date markers for \`month\` (YYYY-MM). */`

### 7. Unused API surface (both)

Nothing calls `queryRegs()` / `querySets()` without a month, or calls
`insertReg` / `insertSet`. They came from the PR. Follow the repo's recent
"drop what nothing reads" refactors (#265): make `month` required and delete
the inserts. The future scraper sync (`docs/migration-status.md`, "The
scrapers and hourly scheduler") can add a write path when it needs one. If
you keep them, keep them on both branches.

### 8. Seeder sections (both)

Both branches added a `// 4.` section after players, so the numbering clashes
and causes a merge conflict. Target, after the merge:

```js
// 4. TCG sets, plus one released and made legal around today
const sampleSets = [ … ];

// 5. VGC regulations, plus one dated near today
const sampleRegs = [ … ];
```

Use the same comment voice for both ("plus one … near/around today"). The
rows object lists tables parent-first and ends `sets: sampleSets,
regs: sampleRegs`. `replaceAllSql` clears them in reverse key order. Log
lines: `  - N sets` then `  - N regulations`. The header comment at the top of
`scripts/seed-d1.mjs` still lists only leagues, events and players. Add sets
and regulations there once.

Each sets row writes `format: "Standard"`, which equals the column default.
Keep it: the seed should read as data, and an explicit value makes a
non-Standard row an obvious one-word edit.

### 9. Test layout (both)

| Aspect | regs | sets | Target |
| --- | --- | --- | --- |
| Fixtures | shared `rows` const | `makeSet(overrides)` factory | factory: add `makeReg(overrides)` |
| Shape check | per-field `marker?.x` asserts | one full `deepEqual` | full `deepEqual` |
| Schedule test events | hand-written literal | built with `toSetMarkers` | build with the builder |
| Second `describe` | "Regulation markers in the schedule" | "set date markers in the schedule" | "regulation date markers in the schedule" / "set date markers in the schedule" |
| Rank test | `rankOf("REGULATION") === 0` | also asserts `< rankOf("WORLDS")` | add the `WORLDS` comparison to regs |

Keep both files separate (`tests/reg-markers.test.ts`,
`tests/set-markers.test.ts`). Do not recreate the PR's
`tests/calendar-markers.test.ts`.

### 10. Resolving the cross-branch merge

`git merge-tree feat/regs feat/sets` reports three textual conflicts, all
from the same edit made on both sides. Resolve them like this:

- `src/db/queries.server.ts`: keep both lines, alphabetical:
  `regs` then `sets`.
- `src/db/events/queries.server.ts`: keep both imports, alphabetical, and
  one `Promise.all`:

  ```ts
  const [allLeagues, monthEvents, regMarkers, setMarkers] = await Promise.all([
  	queryLeagues(),
  	queryMonthEvents(month, includeExcluded),
  	queryRegMarkers(month),
  	querySetMarkers(month),
  ]);
  return {
  	leagues: allLeagues,
  	types: EVENT_TYPE_LABELS,
  	events: sortEventsForSchedule([...monthEvents, ...regMarkers, ...setMarkers]),
  };
  ```

- `scripts/seed-d1.mjs`: see item 8.

`src/web/pokedata/events.ts` was reformatted on both branches with identical
content (blob `10bc0e0`), so it merges cleanly.

### 11. Migrations after the merge

Each branch adds one migration whose parent is
`migrations/20261125115334_baseline`:

- regs: `20261125115658_regs_date_index` (one `CREATE INDEX`)
- sets: `20261125115711_sets_format_and_indexes` (`ALTER TABLE … ADD format`,
  two `CREATE INDEX`)

They touch different tables, so they do not conflict. After both land, load
`drizzle-kit#drizzle` (via `npm exec --no -- intent load`) and run
`npx --no drizzle-kit check`. The next `drizzle-kit generate` writes a merge
migration whose `prevIds` lists both. Do not hand-edit `snapshot.json`.

## Not findings

- `withoutNulls` was correctly dropped on both branches: neither table has
  nullable columns.
- `sets.code` stays `UNIQUE`. The PR dropped the constraint, but marker ids are
  built from the code.
- `src/db/*/markers.ts` sits in the db layer although it is pure. It is
  importable from tests without `cloudflare:workers`, which is what matters
  here. If a `src/lib/markers.ts` home is preferred later, move both together.

## Follow-ups outside both branches

- `docs/migration-status.md` still lists "TCG set and VGC regulation markers"
  as missing. Tick it once both branches are merged.
