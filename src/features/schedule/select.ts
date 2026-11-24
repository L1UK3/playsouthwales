import { isDateMarkerType } from "#/lib/event-types";
import { type EventFilters, groupByDate, matchesFilters } from "#/lib/events";
import type { EventsByDate, ScheduleEvent } from "#/types/domain";

const isDateMarker = (event: ScheduleEvent) =>
	isDateMarkerType(event.eventType);

interface ScheduleSelection {
	calendar: EventsByDate;
	list: EventsByDate;
	sidebar: ScheduleEvent[];
}

export function selectSchedule(
	events: ScheduleEvent[],
	filters: EventFilters,
	month: string,
	day: string | undefined,
): ScheduleSelection {
	const visible = events.filter(
		(event) => isDateMarker(event) || matchesFilters(event, filters),
	);
	const calendar = groupByDate(visible);
	const list = groupByDate(visible.filter((event) => !isDateMarker(event)));
	const sidebar = day
		? (calendar[day] ?? [])
		: visible.filter((event) => event.date.startsWith(month));

	return { calendar, list, sidebar };
}
