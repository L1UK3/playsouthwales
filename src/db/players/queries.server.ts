import { asc, desc, eq } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import type { LeaderboardPosition } from "#/types/domain";
import { getDb } from "../client.server";
import { players } from "./schema";

export interface PlayerValues {
	name: string;
	cp: number;
	playerId: number;
}

export async function queryRankings(): Promise<LeaderboardPosition[]> {
	const rows = await getDb()
		.select({ name: players.name, cp: players.cp })
		.from(players)
		.orderBy(desc(players.cp), asc(players.name));

	return rows.map((row, index) => ({ ...row, position: index + 1 }));
}

/**
 * Makes the players table match `incoming`: players missing from it are
 * removed, changed points are updated and new names are inserted.
 */
export async function replacePlayers(
	incoming: PlayerValues[],
	season: number,
): Promise<void> {
	const db = getDb();
	const existing = await db
		.select({
			name: players.name,
			cp: players.cp,
			playerId: players.playerId,
		})
		.from(players);
	const existingByName = new Map(existing.map((row) => [row.name, row]));
	// A repeated name keeps its last occurrence, so the batch never inserts
	// the same name twice and violates UNIQUE(name).
	const uniqueIncoming = [
		...new Map(incoming.map((player) => [player.name, player])).values(),
	];
	const incomingNames = new Set(uniqueIncoming.map((player) => player.name));

	const statements: BatchItem<"sqlite">[] = [];
	for (const row of existing) {
		if (!incomingNames.has(row.name)) {
			statements.push(db.delete(players).where(eq(players.name, row.name)));
		}
	}
	for (const player of uniqueIncoming) {
		const current = existingByName.get(player.name);
		if (!current) {
			statements.push(db.insert(players).values({ ...player, season }));
		} else if (
			current.cp !== player.cp ||
			current.playerId !== player.playerId
		) {
			statements.push(
				db
					.update(players)
					.set({ cp: player.cp, playerId: player.playerId })
					.where(eq(players.name, player.name)),
			);
		}
	}

	const [first, ...rest] = statements;
	if (first) await db.batch([first, ...rest]);
}
