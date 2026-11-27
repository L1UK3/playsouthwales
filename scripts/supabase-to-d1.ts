#!/usr/bin/env -S npx tsx
// Export production data from Supabase and convert it into a SQLite script for
// the D1 schema in src/db/schema.ts.
//
// Usage:
//   SUPABASE_URL=https://<ref>.supabase.co \
//   SUPABASE_SECRET_KEY=<sb_secret_... key, or the legacy service_role JWT> \
//   npx tsx scripts/supabase-to-d1.ts
//
//   # Re-convert an earlier export without contacting Supabase:
//   npx tsx scripts/supabase-to-d1.ts --from .supabase-export
//
// Options:
//   --out <dir>   where the raw JSON and import.sql go (default .supabase-export)
//   --from <dir>  skip the export and read <table>.json files from <dir>
//   --season <n>  season for welsh_players rows that have none (default: the
//                 current season, as in src/features/rankings/season.ts)
//
// Then apply it:
//   wrangler d1 execute playsouthwales --local  --file=.supabase-export/import.sql
//   wrangler d1 execute playsouthwales --remote --file=.supabase-export/import.sql
//
// import.sql starts by deleting every row in the three D1 tables (leagues,
// events, players), so it is a full replace and is safe to run again.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { parseSeason, type Row, replaceAllSql } from "./lib/d1-sql.ts";

// Supabase rows are untyped JSON from PostgREST.
type SourceRow = Record<string, any>;
type Export = Record<(typeof SOURCE_TABLES)[number], SourceRow[]>;

// Supabase used the pokedata GUID as events.id. D1 assigns new integer ids and
// keeps the GUID here so the pokedata sync can still spot events it has seen.
// weekly_events ids were plain sequence numbers, so they are not kept.
const EVENT_GUID_COLUMN = "pokedataGuid";

const DEFAULT_EVENT_TYPE = "STANDARD"; // EventFormModal default
const DEFAULT_GAME = "TCG"; // pokedata sync default
const D1_MAX_STATEMENT_BYTES = 100_000;
const PAGE_SIZE = 1000;

const SOURCE_TABLES = [
	"leagues",
	"events",
	"weekly_events",
	"welsh_players",
] as const;

const { values: args } = parseArgs({
	options: {
		out: { type: "string", default: ".supabase-export" },
		from: { type: "string" },
		season: { type: "string" },
	},
});

const fallbackSeason = parseSeason(args.season);

const warnings: string[] = [];
const warn = (message: string) => warnings.push(message);

// ---------------------------------------------------------------- export ---

// New sb_secret_ keys go in the apikey header only; legacy service_role keys
// are JWTs and also go in Authorization.
function authHeaders(key: string): Record<string, string> {
	return key.startsWith("eyJ")
		? { apikey: key, Authorization: `Bearer ${key}` }
		: { apikey: key };
}

async function fetchTable(
	baseUrl: string,
	key: string,
	table: string,
): Promise<SourceRow[]> {
	const rows: SourceRow[] = [];
	for (let offset = 0; ; offset += PAGE_SIZE) {
		const url = `${baseUrl}/rest/v1/${table}?select=*&order=id.asc&offset=${offset}&limit=${PAGE_SIZE}`;
		const res = await fetch(url, {
			headers: authHeaders(key),
		});
		if (!res.ok) {
			throw new Error(
				`GET ${table} failed: ${res.status} ${await res.text()}`,
			);
		}
		const page = (await res.json()) as SourceRow[];
		rows.push(...page);
		if (page.length < PAGE_SIZE) return rows;
	}
}

async function exportFromSupabase(outDir: string): Promise<Export> {
	const baseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
	const key =
		process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!baseUrl || !key) {
		throw new Error(
			"Set SUPABASE_URL and SUPABASE_SECRET_KEY, or pass --from <dir>.",
		);
	}
	const data = {} as Export;
	for (const table of SOURCE_TABLES) {
		data[table] = await fetchTable(baseUrl, key, table);
		await writeFile(
			join(outDir, `${table}.json`),
			`${JSON.stringify(data[table], null, 2)}\n`,
		);
		console.log(`exported ${table}: ${data[table].length} rows`);
	}
	return data;
}

async function readExport(dir: string): Promise<Export> {
	const data = {} as Export;
	for (const table of SOURCE_TABLES) {
		data[table] = JSON.parse(await readFile(join(dir, `${table}.json`), "utf8"));
	}
	return data;
}

// --------------------------------------------------------------- convert ---

// Postgres text[] arrives from PostgREST as a JSON array; the plain-text
// events.excludedDates column may hold JSON, a Postgres array literal, or a
// comma-separated list.
function toDateList(value: string | any[] | null | undefined, context: string): string {
	if (value === null || value === undefined || value === "") return "[]";
	if (Array.isArray(value)) return JSON.stringify(value.map(String));
	const text = String(value).trim();
	if (text.startsWith("[")) {
		try {
			const parsed = JSON.parse(text);
			if (Array.isArray(parsed)) return JSON.stringify(parsed.map(String));
		} catch {}
	}
	const inner = text.startsWith("{") && text.endsWith("}") ? text.slice(1, -1) : text;
	const list = inner
		.split(",")
		.map((s) => s.trim().replace(/^"(.*)"$/, "$1"))
		.filter(Boolean);
	if (!text.startsWith("{")) {
		warn(`${context}: excludedDates "${text}" read as a comma-separated list`);
	}
	return JSON.stringify(list);
}

function requiredText(value: string, fallback: string, context: string): string {
	if (typeof value === "string" && value.trim() !== "") return value;
	warn(`${context}: missing value, using "${fallback}"`);
	return fallback;
}

function convert(data: Export): { sql: string; counts: Record<string, number> } {
	const rows: { leagues: Row[]; events: Row[]; players: Row[] } = {
		leagues: [],
		events: [],
		players: [],
	};
	const leagueIds = new Set<unknown>();

	for (const l of data.leagues) {
		leagueIds.add(l.id);
		rows.leagues.push({
			id: l.id,
			name: l.name,
			logo: l.logo,
			website: l.website,
			socialLink: l.socialLink,
			eventLink: l.eventLink,
			brandColor: l.brandColor,
			location: l.location,
			directions: l.directions,
			accessibility: l.accessibility,
			latitude: l.latitude,
			longitude: l.longitude,
			isChampionshipSeries: Boolean(l.isChampionshipSeries),
		});
		if (typeof l.logo === "string" && l.logo.includes(".supabase.co/storage/")) {
			warn(`leagues ${l.id}: logo is hosted in Supabase Storage (${l.logo})`);
		}
	}

	const eventSources: [string, SourceRow[], boolean][] = [
		["events", data.events, false],
		["weekly_events", data.weekly_events, true],
	];
	for (const [table, sourceRows, isRecurring] of eventSources) {
		for (const e of sourceRows) {
			const context = `${table} ${e.id}`;
			if (!leagueIds.has(e.leagueId)) {
				warn(`${context}: skipped, league ${e.leagueId} does not exist`);
				continue;
			}
			const row: Row = {
				leagueId: e.leagueId,
				name: e.name,
				date: e.date,
				startTime: e.startTime,
				eventType: requiredText(e.eventType, DEFAULT_EVENT_TYPE, `${context} eventType`),
				game: requiredText(e.game, DEFAULT_GAME, `${context} game`),
				ticketLink: e.ticketLink,
				description: e.description,
				prizes: e.prizes,
				entryFee: e.entryFee,
				isRecurring,
				excludedDates: toDateList(e.excludedDates, context),
			};
			if (EVENT_GUID_COLUMN && table === "events") {
				row[EVENT_GUID_COLUMN] = String(e.id);
			}
			rows.events.push(row);
		}
	}

	// players.name is no longer unique, so same-name players import as separate
	// rows and are told apart by playerId.
	for (const p of data.welsh_players) {
		const context = `welsh_players ${p.id}`;
		if (p.season === null || p.season === undefined) {
			warn(`${context}: no season, using ${fallbackSeason}`);
		}
		rows.players.push({
			id: p.id,
			name: p.name,
			playerId: p.playerId,
			cp: p.cp ?? 0,
			season: p.season ?? fallbackSeason,
		});
	}

	const { sql, statements } = replaceAllSql(
		["Generated by scripts/supabase-to-d1.ts. Replaces all rows."],
		rows,
	);
	for (const s of statements) {
		const bytes = Buffer.byteLength(s);
		if (bytes > D1_MAX_STATEMENT_BYTES) {
			warn(`statement over D1's 100KB limit (${bytes} bytes): ${s.slice(0, 80)}…`);
		}
	}

	const counts = Object.fromEntries(
		Object.entries(rows).map(([table, tableRows]) => [table, tableRows.length]),
	);
	return { sql, counts };
}

// ------------------------------------------------------------------ main ---

const dir = args.from ?? args.out;
await mkdir(args.out, { recursive: true });
const data = args.from ? await readExport(args.from) : await exportFromSupabase(dir);
const { sql, counts } = convert(data);
const outFile = join(args.out, "import.sql");
await writeFile(outFile, sql);

const source: Record<string, number> = {
	leagues: data.leagues.length,
	events: data.events.length + data.weekly_events.length,
	players: data.welsh_players.length,
};
console.log(`\nwrote ${outFile}\n  table         rows written / rows in Supabase`);
for (const [table, n] of Object.entries(counts)) {
	console.log(`  ${table.padEnd(13)} ${n} / ${source[table]}`);
}
if (warnings.length > 0) {
	console.log(`\n${warnings.length} warning(s):`);
	for (const w of warnings) console.log(`  - ${w}`);
}
