import { createServerFn } from "@tanstack/react-start";
import type { LeaderboardPosition } from "#/types/domain";

interface RankingsData {
	seasons: string[];
	players: LeaderboardPosition[];
}

export const getRankings = createServerFn({ method: "GET" })
	.validator((input: { season: string }) => {
		if (!/^\d{4}$/.test(input.season)) throw new Error("Invalid season");
		return input;
	})
	.handler(async ({ data }): Promise<RankingsData> => {
		return { seasons: [data.season], players: [] };
	});
