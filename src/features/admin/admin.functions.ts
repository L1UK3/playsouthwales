import { createServerFn } from "@tanstack/react-start";
import { querySchedule } from "#/db/queries.server";
import { authMiddleware } from "#/features/auth/auth.middleware";
import { isMonthKey } from "#/lib/month";
import { write } from "node:fs";

/** Same data as the public schedule, but cancelled occurrences stay in, flagged. */
export const getAdminData = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator((input: { month: string }) => {
		if (!isMonthKey(input.month)) throw new Error("Invalid month");
		return input;
	})
	.handler(({ data }) => querySchedule(data.month, true));

export const handleLeagueSubmit = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator((input: { league: string }) => {
		return input;
	})
	.handler(async ({ data }) =>
		write(data.league, "league.txt", (err) => {
			if (err) {
				console.error("Error writing to league.txt", err);
			}
		}),
	);

export const handleDeleteLeague = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator((input: { league: string }) => {
		return input;
	})
	.handler(async ({ data }) =>
		write(data.league, "league.txt", (err) => {
			if (err) {
				console.error("Error writing to league.txt", err);
			}
		}),
	);

export const handleEventSubmit = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator((input: { league: string }) => {
		return input;
	})
	.handler(async ({ data }) =>
		write(data.league, "league.txt", (err) => {
			if (err) {
				console.error("Error writing to league.txt", err);
			}
		}),
	);

export const handleDeleteEvent = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator((input: { league: string }) => {
		return input;
	})
	.handler(async ({ data }) =>
		write(data.league, "league.txt", (err) => {
			if (err) {
				console.error("Error writing to league.txt", err);
			}
		}),
	);

export const handleExcludeEvent = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator((input: { league: string }) => {
		return input;
	})
	.handler(async ({ data }) =>
		write(data.league, "league.txt", (err) => {
			if (err) {
				console.error("Error writing to league.txt", err);
			}
		}),
	);

export const handleUnexcludeEvent = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator((input: { league: string }) => {
		return input;
	})
	.handler(async ({ data }) =>
		write(data.league, "league.txt", (err) => {
			if (err) {
				console.error("Error writing to league.txt", err);
			}
		}),
	);

// handleLeaderboardSubmit - the leaderboard functionality is deprecated.

export const handleNationalRankingsSubmit = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator((input: { league: string }) => {
		return input;
	})
	.handler(async ({ data }) =>
		write(data.league, "league.txt", (err) => {
			if (err) {
				console.error("Error writing to league.txt", err);
			}
		}),
	);
