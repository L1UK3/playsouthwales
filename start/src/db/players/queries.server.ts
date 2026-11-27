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
