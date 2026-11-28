import { and, eq, gte, lt, type SQL } from "drizzle-orm";
import { EVENT_TYPE_LABELS, sortEventsForSchedule } from "#/lib/event-types";
import { type DateRange, isInRange, monthsInRange } from "#/lib/events-query";
import { shiftMonth } from "#/lib/month";
import { expandRecurring } from "#/lib/recurrence";
import type { ScheduleData, ScheduleEvent } from "#/types/domain";
import { getDb } from "../client.server";
import { queryLeagues } from "../leagues/queries.server";
import { queryRegs } from "../regs/queries.server";
import { querySets } from "../sets/queries.server";
import { withoutNulls } from "../utils";
import { type EventValues, events } from "./schema";

async function queryMonthEvents(
	month: string,
	includeExcluded: boolean,
): Promise<ScheduleEvent[]> {
	const db = getDb();
	const monthStart = `${month}-01`;
	const nextMonthStart = `${shiftMonth(month, 1)}-01`;

	const [oneOff, weekly] = await Promise.all([
		db
			.select()
			.from(events)
			.where(
				and(
					eq(events.isRecurring, false),
					gte(events.date, monthStart),
					lt(events.date, nextMonthStart),
				),
			),
		db
			.select()
			.from(events)
			.where(
				and(eq(events.isRecurring, true), lt(events.date, nextMonthStart)),
			),
	]);

	return sortEventsForSchedule([
		...oneOff.map(withoutNulls),
		...expandRecurring(weekly.map(withoutNulls), month, includeExcluded),
	]);
}

/**
 * Events whose day falls in the range, with weekly events expanded into
 * their occurrences and excluded dates left out. Markers are not included.
 */
export async function queryEventsInRange(
	range: DateRange,
	leagueId?: number,
): Promise<ScheduleEvent[]> {
	const db = getDb();
	const league: SQL | undefined =
		leagueId === undefined ? undefined : eq(events.leagueId, leagueId);

	const [oneOff, weekly] = await Promise.all([
		db
			.select()
			.from(events)
			.where(
				and(
					eq(events.isRecurring, false),
					gte(events.date, range.from),
					lt(events.date, range.to),
					league,
				),
			),
		db
			.select()
			.from(events)
			.where(
				and(eq(events.isRecurring, true), lt(events.date, range.to), league),
			),
	]);

	const series = weekly.map(withoutNulls);
	const occurrences = monthsInRange(range)
		.flatMap((month) => expandRecurring(series, month, false))
		.filter((event) => isInRange(event.date, range));

	return sortEventsForSchedule([...oneOff.map(withoutNulls), ...occurrences]);
}

export async function querySchedule(
	month: string,
	includeExcluded: boolean,
): Promise<ScheduleData> {
	const [allLeagues, monthEvents, monthSets, monthRegs] = await Promise.all([
		queryLeagues(),
		queryMonthEvents(month, includeExcluded),
		querySets(month),
		queryRegs(month),
	]);

	const markers: ScheduleEvent[] = [];
	for (const s of monthSets) {
		if (s.releaseDate.startsWith(month)) {
			markers.push({
				id: `release-${s.code}`,
				name: s.name,
				date: s.releaseDate,
				startTime: "",
				leagueId: -1,
				eventType: "RELEASE",
				game: "TCG",
				description: `Official English release date for ${s.name} (${s.code}).`,
				entryFee: "",
			});
		}
		if (s.legalDate.startsWith(month)) {
			markers.push({
				id: `legality-${s.code}`,
				name: s.name,
				date: s.legalDate,
				startTime: "",
				leagueId: -1,
				eventType: "LEGALITY",
				game: "TCG",
				description: `Official standard legality date for ${s.name} (${s.code}).`,
				entryFee: "",
			});
		}
	}
	for (const r of monthRegs) {
		if (r.date.startsWith(month)) {
			markers.push({
				id: `reg-${r.name.toLowerCase().replace(/\s+/g, "-")}`,
				name: r.name,
				date: r.date,
				startTime: "",
				leagueId: -1,
				eventType: "REGULATION",
				game: "VGC",
				description: `Official VGC regulation date for ${r.name}.`,
				entryFee: "",
			});
		}
	}

	return {
		leagues: allLeagues,
		types: EVENT_TYPE_LABELS,
		events: sortEventsForSchedule([...monthEvents, ...markers]),
	};
}

export async function insertEvent(values: EventValues): Promise<void> {
	await getDb().insert(events).values(values);
}

/** Returns false when no event row has the given id. */
export async function updateEvent(
	id: number,
	values: Partial<EventValues>,
): Promise<boolean> {
	const rows = await getDb()
		.update(events)
		.set(values)
		.where(eq(events.id, id))
		.returning({ id: events.id });
	return rows.length > 0;
}

/** Returns undefined when no event row has the given id. */
export async function findEvent(
	id: number,
): Promise<
	{ id: number; isRecurring: boolean; excludedDates: string[] } | undefined
> {
	const [row] = await getDb()
		.select({
			id: events.id,
			isRecurring: events.isRecurring,
			excludedDates: events.excludedDates,
		})
		.from(events)
		.where(eq(events.id, id));
	return row;
}

/** Deletes an event row, which for a series removes every occurrence. */
export async function deleteEvent(id: number): Promise<boolean> {
	const rows = await getDb()
		.delete(events)
		.where(eq(events.id, id))
		.returning({ id: events.id });
	return rows.length > 0;
}

/**
 * Inserts imported events atomically, one statement per row to stay under
 * D1's bound parameter limit. Rows whose guid already exists are skipped.
 */
export async function insertPokedataEvents(rows: EventValues[]): Promise<void> {
	const db = getDb();
	const [first, ...rest] = rows.map((row) =>
		db
			.insert(events)
			.values(row)
			.onConflictDoNothing({ target: events.pokedataGuid }),
	);
	if (!first) return;
	await db.batch([first, ...rest]);
}
