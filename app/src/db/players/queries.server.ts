import { eq } from "drizzle-orm";
import { rankPlayers } from "#/features/rankings/ranking";
import type { LeaderboardPosition } from "#/types/domain";
import { getDb } from "../client.server";
import { players } from "./schema";

export async function queryRankings(): Promise<LeaderboardPosition[]> {
	const rows = await getDb()
		.select({ name: players.name, cp: players.cp })
		.from(players);

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
