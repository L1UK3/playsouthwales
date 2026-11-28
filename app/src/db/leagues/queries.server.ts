import { asc, eq } from "drizzle-orm";
import type { League } from "#/types/domain";
import { getDb } from "../client.server";
import { events } from "../events/schema";
import { withoutNulls } from "../utils";
import { type LeagueValues, leagues } from "./schema";

export async function queryLeagues(): Promise<League[]> {
	const rows = await getDb().select().from(leagues).orderBy(asc(leagues.id));

	return rows.map((row) => {
		const { id, ...league } = withoutNulls(row);
		return {
			...league,
			leagueId: id,
		};
	});
}

/** Returns false when no league has the given id. */
export async function updateLeague(
	id: number,
	values: LeagueValues,
): Promise<boolean> {
	const rows = await getDb()
		.update(leagues)
		.set(values)
		.where(eq(leagues.id, id))
		.returning({ id: leagues.id });
	return rows.length > 0;
}

/** Removes a league and its events atomically. */
export async function deleteLeague(id: number): Promise<void> {
	const db = getDb();
	await db.batch([
		db.delete(events).where(eq(events.leagueId, id)),
		db.delete(leagues).where(eq(leagues.id, id)),
	]);
}

/**
 * Returns undefined when no league row has the given id.
 */
export async function findLeague(
	id: number,
): Promise<{ id: number; isChampionshipSeries: boolean } | undefined> {
	const [row] = await getDb()
		.select({
			id: leagues.id,
			isChampionshipSeries: leagues.isChampionshipSeries,
		})
		.from(leagues)
		.where(eq(leagues.id, id));
	return row;
}

export async function insertLeague(values: LeagueValues): Promise<void> {
	await getDb().insert(leagues).values(values);
}
