import { createServerFn } from "@tanstack/react-start";
import { queryRankings } from "#/db/queries.server";
import { currentSeason } from "./season";

export const getRankings = createServerFn({ method: "GET" })
	.validator((input: { season: string }) => {
		if (!/^\d{4}$/.test(input.season)) throw new Error("Invalid season");
		return input;
	})
	// The players table holds one live ranking, so only the current season
	// exists. The requested season is validated but does not filter anything.
	.handler(async () => ({
		seasons: [currentSeason()],
		players: await queryRankings(),
	}));
