import { createServerFn } from "@tanstack/react-start";
import { querySchedule } from "#/db/queries.server";
import { authMiddleware } from "#/features/auth/auth.middleware";
import { isMonthKey } from "#/lib/month";
import type { Top20PlayerInput } from "./components/NationalRankingsModal";

/** A one-off event id, or `"<seriesId>:<YYYY-MM-DD>"` for a series occurrence. */
export type EventId = number | string;

export interface LeagueSubmitInput {
	leagueId?: number;
	name: string;
	location?: string;
	latitude?: number;
	longitude?: number;
	brandColor?: string;
	logo?: string;
	website?: string;
	eventLink?: string;
	socialLink?: string;
	directions?: string;
	accessibility?: string;
	isChampionshipSeries: boolean;
}

export interface EventSubmitInput {
	id?: EventId;
	leagueId: number;
	name: string;
	date: string;
	startTime?: string;
	eventType: string;
	game: string;
	ticketLink?: string;
	description?: string;
	prizes?: string;
	entryFee?: string;
	isRecurring: boolean;
}

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
	.validator((input: LeagueSubmitInput) => input)
	.handler(async () => {
		throw new Error("Not implemented");
	});

export const handleDeleteLeague = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator((input: { leagueId: number }) => input)
	.handler(async () => {
		throw new Error("Not implemented");
	});

export const handleEventSubmit = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator((input: EventSubmitInput) => input)
	.handler(async () => {
		throw new Error("Not implemented");
	});

export const handleDeleteEvent = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator((input: { id: EventId }) => input)
	.handler(async () => {
		throw new Error("Not implemented");
	});

export const handleExcludeEvent = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator((input: { id: EventId }) => input)
	.handler(async () => {
		throw new Error("Not implemented");
	});

export const handleUnexcludeEvent = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator((input: { id: EventId }) => input)
	.handler(async () => {
		throw new Error("Not implemented");
	});

// handleLeaderboardSubmit - the leaderboard functionality is deprecated.

export const handleNationalRankingsSubmit = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator((input: { players: Top20PlayerInput[] }) => input)
	.handler(async () => {
		throw new Error("Not implemented");
	});
