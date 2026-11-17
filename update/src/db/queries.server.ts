import { asc } from "drizzle-orm";
import type { League } from "#/types/domain";
import { getDb } from "./client.server";
import { leaderboards, leagues } from "./schema";

function withoutNulls<Row extends object>(
	row: Row,
): { [Key in keyof Row]: NonNullable<Row[Key]> } {
	return Object.fromEntries(
		Object.entries(row).filter(([, value]) => value !== null),
	) as { [Key in keyof Row]: NonNullable<Row[Key]> };
}

export async function queryLeagues(): Promise<League[]> {
	const db = getDb();
	const rows = await db.select().from(leagues).orderBy(asc(leagues.id));
	const standings = await db
		.select({ leagueId: leaderboards.leagueId })
		.from(leaderboards);
	const leagueIdsWithStandings = new Set(standings.map((s) => s.leagueId));

	return rows.map((row) => {
		const { id, ...league } = withoutNulls(row);
		return {
			...league,
			leagueId: id,
			hasStandings: leagueIdsWithStandings.has(id),
		};
	});
}
