/**
 * Query parsing, response shape and grouping for `GET /api/events`, kept free
 * of database imports so tests can load it. The contract is documented in
 * src/routes/api/api.md.
 */

import { ApiError } from "#/lib/api";
import { currentMonthKey, eventDateKey, isMonthKey } from "#/lib/month";
import { isValidCalendarDate } from "#/lib/recurrence";
import type { ScheduleEvent } from "#/types/domain";

const GROUP_BY = ["league", "day", "month", "year"] as const;
type GroupBy = (typeof GROUP_BY)[number];

/** An event in the public API shape. */
export interface ApiEvent {
	id: number | string;
	name: string;
	date: string;
	startTime?: string;
	leagueId: number;
	eventType: string;
	game: string;
	ticketLink?: string;
	description?: string;
	prizes?: string;
	entryFee?: string;
	isRecurring: boolean;
	recurringEventId?: number;
}

function invalid(name: string, expected: string): never {
	throw new ApiError(
		400,
		"invalid_parameter",
		`Invalid ${name}: expected ${expected}`,
	);
}

/**
 * Reads and validates the query string, throwing a 400 ApiError on bad input.
 * `period` is the `YYYY-MM-DD`, `YYYY-MM` or `YYYY` that every returned date
 * starts with: the most specific date filter, or the current month when there
 * is none, because weekly events can't be expanded over an unbounded range.
 * It is `null` when the date filters don't overlap.
 */
export function parseEventsQuery(params: URLSearchParams, now = new Date()) {
	const leagueId = params.get("leagueId");
	const day = params.get("day");
	const month = params.get("month");
	const year = params.get("year");
	const groupBy = params.get("groupBy");

	if (
		leagueId !== null &&
		!(/^-?\d+$/.test(leagueId) && Number.isSafeInteger(Number(leagueId)))
	) {
		invalid("leagueId", "an integer");
	}
	if (day !== null && !isValidCalendarDate(day)) {
		invalid("day", "a real date as YYYY-MM-DD");
	}
	if (month !== null && !isMonthKey(month)) invalid("month", "YYYY-MM");
	if (year !== null && !/^\d{4}$/.test(year)) invalid("year", "YYYY");
	if (groupBy !== null && !GROUP_BY.includes(groupBy as GroupBy)) {
		invalid("groupBy", GROUP_BY.join(", "));
	}

	const period = day ?? month ?? year ?? currentMonthKey(now);
	const overlaps = [month, year].every(
		(f) => f === null || period.startsWith(f),
	);
	return {
		leagueId: leagueId === null ? undefined : Number(leagueId),
		period: overlaps ? period : null,
		groupBy: (groupBy ?? undefined) as GroupBy | undefined,
	};
}

/** Maps a schedule event to the public shape, leaving out empty optionals. */
export function toApiEvent(event: ScheduleEvent): ApiEvent {
	const result: ApiEvent = {
		id: event.id,
		name: event.name,
		date: eventDateKey(event),
		leagueId: event.leagueId,
		eventType: event.eventType,
		game: event.game,
		isRecurring: event.isRecurring ?? false,
	};
	const startTime = event.startTime?.slice(0, 5);
	if (startTime) result.startTime = startTime;
	if (event.ticketLink) result.ticketLink = event.ticketLink;
	if (event.description) result.description = event.description;
	if (event.prizes) result.prizes = event.prizes;
	if (event.entryFee) result.entryFee = event.entryFee;
	if (event.recurringEventId !== undefined) {
		result.recurringEventId = event.recurringEventId;
	}
	return result;
}

const DATE_KEY_LENGTH = { day: 10, month: 7, year: 4 };

/** Groups events by key, keeping their order within each group. */
export function groupEvents(
	events: ApiEvent[],
	groupBy: GroupBy,
): Record<string, ApiEvent[]> {
	const grouped: Record<string, ApiEvent[]> = {};
	for (const event of events) {
		const key =
			groupBy === "league"
				? String(event.leagueId)
				: event.date.slice(0, DATE_KEY_LENGTH[groupBy]);
		grouped[key] ??= [];
		grouped[key].push(event);
	}
	return grouped;
}
