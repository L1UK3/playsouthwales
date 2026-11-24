import { createServerFn } from "@tanstack/react-start";
import {
	deleteEvent,
	deleteLeague,
	findEvent,
	findLeague,
	insertEvent,
	insertLeague,
	querySchedule,
	replacePlayers,
	updateEvent,
	updateLeague,
} from "#/db/queries.server";
import { authMiddleware } from "#/features/auth/auth.middleware";
import { isMonthKey } from "#/lib/month";
import { isValidCalendarDate } from "#/lib/recurrence";

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

/** One row of the National Rankings as entered by an admin. */
export interface Top20PlayerInput {
	name: string;
	cp: number;
	playerId?: number;
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

/** Validator for the server functions that take only an event id. */
function validateEventIdInput(input: { id: EventId }) {
	parseEventId(input.id);
	return input;
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
		if (input.latitude != null && !Number.isFinite(input.latitude)) {
			throw new Error("Latitude must be a number");
		}
		if (input.longitude != null && !Number.isFinite(input.longitude)) {
			throw new Error("Longitude must be a number");
		}
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
		if (!isValidCalendarDate(input.date)) {
			throw new Error("Event date must be a valid calendar date (YYYY-MM-DD)");
		}
		if (!Number.isInteger(input.leagueId) || input.leagueId <= 0) {
			throw new Error("A valid league is required");
		}
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
		// Editing an occurrence edits the series it belongs to. The occurrence's
		// date is not the series start, so it is not written: doing so would move
		// the series template and drop its earlier occurrences.
		const { rowId, occurrenceDate } = parseEventId(data.id);
		if (data.isRecurring !== undefined) {
			const stored = await findEvent(rowId);
			if (!stored) throw new Error("Event not found");
			if (stored.isRecurring !== data.isRecurring) {
				throw new Error(
					"Changing an event between one-off and recurring is not supported",
				);
			}
		}
		const { date: _date, ...seriesValues } = values;
		const fields = occurrenceDate === undefined ? values : seriesValues;
		if (!(await updateEvent(rowId, fields))) {
			throw new Error("Event not found");
		}
	});

export const handleDeleteEvent = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(validateEventIdInput)
	.handler(async ({ data }) => {
		// A series occurrence deletes the whole series, as the legacy API did.
		const { rowId } = parseEventId(data.id);
		if (!(await deleteEvent(rowId))) throw new Error("Event not found");
	});

/** Adds or removes one occurrence date on its series' excluded dates. */
async function setOccurrenceExcluded(id: EventId, excluded: boolean) {
	const { rowId, occurrenceDate } = parseEventId(id);
	if (!occurrenceDate) {
		throw new Error("Only recurring occurrences can be excluded");
	}
	const series = await findEvent(rowId);
	if (!series?.isRecurring) throw new Error("Event not found");

	const others = series.excludedDates.filter((date) => date !== occurrenceDate);
	const excludedDates = excluded ? [...others, occurrenceDate] : others;
	if (!(await updateEvent(rowId, { excludedDates }))) {
		throw new Error("Event not found");
	}
}

export const handleExcludeEvent = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(validateEventIdInput)
	.handler(({ data }) => setOccurrenceExcluded(data.id, true));

export const handleUnexcludeEvent = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(validateEventIdInput)
	.handler(({ data }) => setOccurrenceExcluded(data.id, false));

/** Seasons start in July and are named after the year they end in. */
function currentSeason(now: Date): number {
	return now.getUTCMonth() >= 6
		? now.getUTCFullYear() + 1
		: now.getUTCFullYear();
}

/** Truncates a finite number to an integer; anything else becomes 0. */
function toInteger(value: number | undefined): number {
	return typeof value === "number" && Number.isFinite(value)
		? Math.trunc(value)
		: 0;
}

export const handleNationalRankingsSubmit = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator((input: { players: Top20PlayerInput[] }) => input)
	.handler(async ({ data }) => {
		const players = data.players
			.map((player) => ({
				name: player.name.trim(),
				cp: toInteger(player.cp),
				playerId: toInteger(player.playerId),
			}))
			.filter((player) => player.name !== "");

		await replacePlayers(players, currentSeason(new Date()));
	});
