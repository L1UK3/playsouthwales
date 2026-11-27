// Shared SQL emission for scripts that write a full-replace D1 import file
// (seed-d1.mjs, supabase-to-d1.mjs). Both scripts describe rows as plain
// objects keyed by the column names in src/db/*/schema.ts; this module owns
// how those rows become SQLite text.

/** The three D1 tables, children first so deletes never trip a foreign key. */
const TABLES_CHILD_FIRST = ["players", "events", "leagues"];

/** The season rolls over in July. Mirrors currentSeason() in src/features/rankings/season.ts. */
function defaultSeason(now = new Date()) {
	return now.getUTCMonth() + 1 >= 7
		? now.getUTCFullYear() + 1
		: now.getUTCFullYear();
}

/** Reads a `--season` flag value, falling back to the current season. */
export function parseSeason(flag) {
	const season = flag ? Number(flag) : defaultSeason();
	if (!Number.isInteger(season)) {
		throw new Error(`--season must be a whole year, got "${flag}"`);
	}
	return season;
}

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
	const names = columns.map((c) => `\`${c}\``).join(", ");
	const values = columns.map((c) => sqlValue(row[c])).join(", ");
	return `INSERT INTO \`${table}\` (${names}) VALUES (${values});`;
}

/**
 * Builds a script that empties every table, restarts autoincrement ids so a
 * re-run gives the same ids, then inserts `rows` (table name -> row objects,
 * inserted in key order, so list parent tables first).
 *
 * Returns the script and its individual statements, so callers can check
 * statement sizes against D1 limits.
 */
export function replaceAllSql(header, rows) {
	const statements = [
		...TABLES_CHILD_FIRST.map((table) => `DELETE FROM \`${table}\`;`),
		`DELETE FROM \`sqlite_sequence\` WHERE \`name\` IN (${TABLES_CHILD_FIRST.map(sqlValue).join(", ")});`,
	];
	for (const [table, tableRows] of Object.entries(rows)) {
		for (const row of tableRows) statements.push(insert(table, row));
	}
	const comments = header.map((line) => `-- ${line}`);
	return {
		sql: `${[...comments, ...statements].join("\n")}\n`,
		statements,
	};
}
