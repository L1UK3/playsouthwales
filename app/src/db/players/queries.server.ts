import { eq } from "drizzle-orm";
import { rankPlayers } from "#/features/rankings/ranking";
import { getDb } from "../client.server";
import { players } from "./schema";

/** National Rankings, for one season when `season` is given. */
export async function queryRankings(season?: number) {
	const rows = await getDb()
		.select({ name: players.name, playerId: players.playerId, cp: players.cp })
		.from(players)
		.where(season === undefined ? undefined : eq(players.season, season));

	return rankPlayers(rows);
}

/** Sets each named player's championship points in one batch. */
export async function updatePlayerCp(
	points: { name: string; cp: number }[],
): Promise<void> {
	const db = getDb();
	const [first, ...rest] = points.map(({ name, cp }) =>
		db.update(players).set({ cp }).where(eq(players.name, name)),
	);
	if (!first) return;
	await db.batch([first, ...rest]);
}
