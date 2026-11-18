#!/usr/bin/env node
// Export production data from Supabase and convert it into a SQLite script for
// the D1 schema in src/db/schema.ts.
//
// Usage:
//   SUPABASE_URL=https://<ref>.supabase.co \
//   SUPABASE_SECRET_KEY=<sb_secret_... key, or the legacy service_role JWT> \
//   node scripts/supabase-to-d1.mjs
//
//   # Re-convert an earlier export without contacting Supabase:
//   node scripts/supabase-to-d1.mjs --from .supabase-export
//
// Options:
//   --out <dir>   where the raw JSON and import.sql go (default .supabase-export)
//   --from <dir>  skip the export and read <table>.json files from <dir>
//
// Then apply it:
//   wrangler d1 execute playsouthwales --local  --file=.supabase-export/import.sql
//   wrangler d1 execute playsouthwales --remote --file=.supabase-export/import.sql
//
// import.sql starts by deleting every row in the four D1 tables, so it is a
// full replace and is safe to run again.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";

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
	"leaderboards",
	"welsh_players",
];

const { values: args } = parseArgs({
	options: {
		out: { type: "string", default: ".supabase-export" },
		from: { type: "string" },
	},
});

const warnings = [];
const warn = (message) => warnings.push(message);

// ---------------------------------------------------------------- export ---

// New sb_secret_ keys go in the apikey header only; legacy service_role keys
// are JWTs and also go in Authorization.
function authHeaders(key) {
	return key.startsWith("eyJ")
		? { apikey: key, Authorization: `Bearer ${key}` }
		: { apikey: key };
}

async function fetchTable(baseUrl, key, table) {
	const rows = [];
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
		const page = await res.json();
		rows.push(...page);
		if (page.length < PAGE_SIZE) return rows;
	}
}

async function exportFromSupabase(outDir) {
	const baseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
	const key =
		process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!baseUrl || !key) {
		throw new Error(
			"Set SUPABASE_URL and SUPABASE_SECRET_KEY, or pass --from <dir>.",
		);
	}
	const data = {};
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

async function readExport(dir) {
	const data = {};
	for (const table of SOURCE_TABLES) {
		data[table] = JSON.parse(await readFile(join(dir, `${table}.json`), "utf8"));
	}
	return data;
}

// --------------------------------------------------------------- convert ---

function sqlValue(value) {
	if (value === null || value === undefined) return "NULL";
	if (typeof value === "boolean") return value ? "1" : "0";
	if (typeof value === "number") {
		if (!Number.isFinite(value)) return "NULL";
		return String(value);
	}
	return `'${String(value).replaceAll("'", "''")}'`;
}

function insert(table, row) {
	const columns = Object.keys(row);
	return `INSERT INTO \`${table}\` (${columns.map((c) => `\`${c}\``).join(", ")}) VALUES (${columns.map((c) => sqlValue(row[c])).join(", ")});`;
}

// Postgres text[] arrives from PostgREST as a JSON array; the plain-text
// events.excludedDates column may hold JSON, a Postgres array literal, or a
// comma-separated list.
function toDateList(value, context) {
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

function requiredText(value, fallback, context) {
	if (typeof value === "string" && value.trim() !== "") return value;
	warn(`${context}: missing value, using "${fallback}"`);
	return fallback;
}

function toUnixSeconds(value, context) {
	const ms = Date.parse(value);
	if (Number.isNaN(ms)) {
		warn(`${context}: unreadable created_at "${value}", using now`);
		return Math.floor(Date.now() / 1000);
	}
	return Math.floor(ms / 1000);
}

function convert(data) {
	const statements = [];
	const leagueIds = new Set();
	const counts = { leagues: 0, events: 0, leaderboards: 0, players: 0 };

	for (const l of data.leagues) {
		leagueIds.add(l.id);
		counts.leagues++;
		statements.push(
			insert("leagues", {
				id: l.id,
				name: l.name,
				logo: l.logo,
				website: l.website,
				socialLink: l.socialLink,
				eventLink: l.eventLink,
				webLink: l.webLink,
				brandColor: l.brandColor,
				location: l.location,
				directions: l.directions,
				accessibility: l.accessibility,
				latitude: l.latitude,
				longitude: l.longitude,
				isChampionshipSeries: Boolean(l.isChampionshipSeries),
			}),
		);
		if (typeof l.logo === "string" && l.logo.includes(".supabase.co/storage/")) {
			warn(`leagues ${l.id}: logo is hosted in Supabase Storage (${l.logo})`);
		}
	}

	const eventSources = [
		["events", data.events, false],
		["weekly_events", data.weekly_events, true],
	];
	for (const [table, rows, isRecurring] of eventSources) {
		for (const e of rows) {
			const context = `${table} ${e.id}`;
			if (!leagueIds.has(e.leagueId)) {
				warn(`${context}: skipped, league ${e.leagueId} does not exist`);
				continue;
			}
			const row = {
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
			statements.push(insert("events", row));
			counts.events++;
		}
	}

	for (const lb of data.leaderboards) {
		const context = `leaderboards ${lb.id}`;
		if (!leagueIds.has(lb.leagueId)) {
			warn(`${context}: skipped, league ${lb.leagueId} does not exist`);
			continue;
		}
		counts.leaderboards++;
		statements.push(
			insert("leaderboards", {
				id: lb.id,
				leagueId: lb.leagueId,
				data: JSON.stringify(lb.data ?? []),
				createdAt: toUnixSeconds(lb.created_at, context),
			}),
		);
	}

	for (const p of data.welsh_players) {
		counts.players++;
		statements.push(
			insert("players", {
				id: p.id,
				name: p.name,
				playerId: p.playerId,
				cp: p.cp ?? 0,
			}),
		);
	}

	for (const s of statements) {
		const bytes = Buffer.byteLength(s);
		if (bytes > D1_MAX_STATEMENT_BYTES) {
			warn(`statement over D1's 100KB limit (${bytes} bytes): ${s.slice(0, 80)}…`);
		}
	}

	const sql = [
		"-- Generated by scripts/supabase-to-d1.mjs. Replaces all rows.",
		"DELETE FROM `players`;",
		"DELETE FROM `leaderboards`;",
		"DELETE FROM `events`;",
		"DELETE FROM `leagues`;",
		// Restart event ids at 1 so re-running the import gives the same ids.
		"DELETE FROM `sqlite_sequence` WHERE `name` = 'events';",
		...statements,
		"",
	].join("\n");
	return { sql, counts };
}

// ------------------------------------------------------------------ main ---

const dir = args.from ?? args.out;
await mkdir(args.out, { recursive: true });
const data = args.from ? await readExport(args.from) : await exportFromSupabase(dir);
const { sql, counts } = convert(data);
const outFile = join(args.out, "import.sql");
await writeFile(outFile, sql);

const source = {
	leagues: data.leagues.length,
	events: data.events.length + data.weekly_events.length,
	leaderboards: data.leaderboards.length,
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
