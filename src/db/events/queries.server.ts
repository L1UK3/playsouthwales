import { and, eq, gte, lt } from "drizzle-orm";
import { EVENT_TYPE_LABELS, sortEventsForSchedule } from "#/lib/event-types";
import { shiftMonth } from "#/lib/month";
import { expandRecurring } from "#/lib/recurrence";
import type { ScheduleData, ScheduleEvent } from "#/types/domain";
import { getDb } from "../client.server";
import { queryLeagues } from "../leagues/queries.server";
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

export async function querySchedule(
	month: string,
	includeExcluded: boolean,
): Promise<ScheduleData> {
	const [allLeagues, monthEvents] = await Promise.all([
		queryLeagues(),
		queryMonthEvents(month, includeExcluded),
	]);
	return { leagues: allLeagues, types: EVENT_TYPE_LABELS, events: monthEvents };
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
