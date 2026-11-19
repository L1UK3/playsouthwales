import { createServerFn } from "@tanstack/react-start";
import {
	deleteEvent,
	deleteLeague,
	findLeague,
	insertEvent,
	insertLeague,
	querySchedule,
	updateEvent,
	updateLeague,
} from "#/db/queries.server";
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
	isChampionshipSeries?: boolean;
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
	isRecurring?: boolean;
}

/** Splits an event id into the stored row id and, for occurrences, the date. */
function parseEventId(id: EventId): { rowId: number; occurrenceDate?: string } {
	if (typeof id === "number") {
		if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid event id");
		return { rowId: id };
	}
	const match = /^(\d+):(\d{4}-\d{2}-\d{2})$/.exec(id);
	if (!match) throw new Error("Invalid event id");
	return { rowId: Number(match[1]), occurrenceDate: match[2] };
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
	.validator((input: LeagueSubmitInput) => {
		if (!input.name.trim()) throw new Error("League name is required");
		return input;
	})
	.handler(async ({ data }) => {
		const values = {
			name: data.name,
			location: data.location ?? null,
			latitude: data.latitude ?? null,
			longitude: data.longitude ?? null,
			brandColor: data.brandColor ?? null,
			logo: data.logo ?? null,
			website: data.website ?? null,
			eventLink: data.eventLink ?? null,
			socialLink: data.socialLink ?? null,
			directions: data.directions ?? null,
			accessibility: data.accessibility ?? null,
			isChampionshipSeries: data.isChampionshipSeries ?? false,
		};

		if (data.leagueId === undefined) {
			await insertLeague(values);
			return;
		}
		if (!(await updateLeague(data.leagueId, values))) {
			throw new Error("League not found");
		}
	});

export const handleDeleteLeague = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator((input: { leagueId: number }) => input)
	.handler(async ({ data }) => {
		const league = await findLeague(data.leagueId);
		if (!league) throw new Error("League not found");
		if (league.isChampionshipSeries) {
			throw new Error("The championship series league cannot be deleted.");
		}
		await deleteLeague(data.leagueId);
	});

export const handleEventSubmit = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator((input: EventSubmitInput) => {
		if (!input.name.trim()) throw new Error("Event name is required");
		if (input.id !== undefined) parseEventId(input.id);
		return input;
	})
	.handler(async ({ data }) => {
		const values = {
			leagueId: data.leagueId,
			name: data.name,
			date: data.date,
			startTime: data.startTime ?? null,
			eventType: data.eventType,
			game: data.game,
			ticketLink: data.ticketLink ?? null,
			description: data.description ?? null,
			prizes: data.prizes ?? null,
			entryFee: data.entryFee ?? null,
		};

		if (data.id === undefined) {
			await insertEvent({ ...values, isRecurring: data.isRecurring ?? false });
			return;
		}
		// Editing an occurrence edits the series it belongs to.
		const { rowId } = parseEventId(data.id);
		if (!(await updateEvent(rowId, values))) {
			throw new Error("Event not found");
		}
	});

export const handleDeleteEvent = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator((input: { id: EventId }) => {
		parseEventId(input.id);
		return input;
	})
	.handler(async ({ data }) => {
		// A series occurrence deletes the whole series, as the legacy API did.
		const { rowId } = parseEventId(data.id);
		if (!(await deleteEvent(rowId))) throw new Error("Event not found");
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
