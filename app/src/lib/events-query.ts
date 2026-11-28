/**
 * Query parsing, date ranges, response shapes and grouping for
 * `GET /api/events`, kept free of database imports so tests can load it.
 * The contract is documented in src/routes/api/api.md.
 */

import { ApiError } from "#/lib/api";
import {
	currentMonthKey,
	eventDateKey,
	isMonthKey,
	shiftMonth,
} from "#/lib/month";
import { isValidCalendarDate } from "#/lib/recurrence";
import type { ScheduleEvent } from "#/types/domain";

export const GROUP_BY_KEYS = ["league", "day", "month", "year"] as const;
export type GroupBy = (typeof GROUP_BY_KEYS)[number];

export interface EventsQuery {
	leagueId?: number;
	day?: string;
	month?: string;
	year?: string;
	groupBy?: GroupBy;
}

/** Days from `from` (inclusive) to `to` (exclusive), both `YYYY-MM-DD`. */
export interface DateRange {
	from: string;
	to: string;
}

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

export type GroupedEvents = Record<string, ApiEvent[]>;

function invalid(message: string): ApiError {
	return new ApiError(400, "invalid_parameter", message);
}

function single(params: URLSearchParams, name: string): string | undefined {
	const values = params.getAll(name);
	if (values.length > 1) throw invalid(`${name} must be given at most once`);
	return values[0];
}

/** Reads and validates the query string, throwing a 400 ApiError on bad input. */
export function parseEventsQuery(params: URLSearchParams): EventsQuery {
	const query: EventsQuery = {};

	const leagueId = single(params, "leagueId");
	if (leagueId !== undefined) {
		const id = Number(leagueId);
		if (!/^-?\d+$/.test(leagueId) || !Number.isSafeInteger(id)) {
			throw invalid("Invalid leagueId: expected an integer");
		}
		query.leagueId = id;
	}

	const day = single(params, "day");
	if (day !== undefined) {
		if (!isValidCalendarDate(day)) {
			throw invalid("Invalid day: expected a real date as YYYY-MM-DD");
		}
		query.day = day;
	}

	const month = single(params, "month");
	if (month !== undefined) {
		if (!isMonthKey(month)) {
			throw invalid("Invalid month: expected YYYY-MM");
		}
		query.month = month;
	}

	const year = single(params, "year");
	if (year !== undefined) {
		if (!/^\d{4}$/.test(year)) throw invalid("Invalid year: expected YYYY");
		query.year = year;
	}

	const groupBy = single(params, "groupBy");
	if (groupBy !== undefined) {
		if (!(GROUP_BY_KEYS as readonly string[]).includes(groupBy)) {
			throw invalid(`Invalid groupBy: expected ${GROUP_BY_KEYS.join(", ")}`);
		}
		query.groupBy = groupBy as GroupBy;
	}

	return query;
}

function nextDay(day: string): string {
	const date = new Date(`${day}T00:00:00Z`);
	date.setUTCDate(date.getUTCDate() + 1);
	return date.toISOString().slice(0, 10);
}

function monthRange(month: string): DateRange {
	return { from: `${month}-01`, to: `${shiftMonth(month, 1)}-01` };
}

/**
 * The days the query covers. Each of `day`, `month` and `year` narrows the
 * range, so combined filters intersect and may cover no days at all (`null`).
 * With no date filter the range is the current month, because weekly events
 * can't be expanded over an unbounded range.
 */
export function eventsDateRange(
	query: EventsQuery,
	now = new Date(),
): DateRange | null {
	const ranges: DateRange[] = [];
	if (query.day) ranges.push({ from: query.day, to: nextDay(query.day) });
	if (query.month) ranges.push(monthRange(query.month));
	if (query.year) {
		ranges.push({
			from: `${query.year}-01-01`,
			to: `${Number(query.year) + 1}-01-01`,
		});
	}
	if (ranges.length === 0) ranges.push(monthRange(currentMonthKey(now)));

	const from = ranges
		.map((r) => r.from)
		.sort()
		.at(-1);
	const to = ranges.map((r) => r.to).sort()[0];
	return from && to && from < to ? { from, to } : null;
}

/** Every `YYYY-MM` month that overlaps the range, in order. */
export function monthsInRange(range: DateRange): string[] {
	const months: string[] = [];
	for (
		let month = range.from.slice(0, 7);
		`${month}-01` < range.to;
		month = shiftMonth(month, 1)
	) {
		months.push(month);
	}
	return months;
}

export function isInRange(date: string, range: DateRange): boolean {
	return date >= range.from && date < range.to;
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

function groupKey(event: ApiEvent, groupBy: GroupBy): string {
	switch (groupBy) {
		case "league":
			return String(event.leagueId);
		case "day":
			return event.date;
		case "month":
			return event.date.slice(0, 7);
		case "year":
			return event.date.slice(0, 4);
	}
}

/** Groups events by key, keeping their order within each group. */
export function groupEvents(
	events: ApiEvent[],
	groupBy: GroupBy,
): GroupedEvents {
	const grouped: GroupedEvents = {};
	for (const event of events) {
		const key = groupKey(event, groupBy);
		grouped[key] ??= [];
		grouped[key].push(event);
	}
	return grouped;
}
