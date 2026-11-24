import React from "react";
import { sortEventsForSchedule } from "#/lib/event-types";
import type { ScheduleEvent } from "#/types/domain";

/**
 * Re-applies public schedule order (date, event type rank, start time) after
 * client-side merges (weekly expansion, virtual markers).
 */
export const eventsInScheduleOrder = sortEventsForSchedule;

export function useSortEvents(events: ScheduleEvent[]) {
	return React.useMemo(() => sortEventsForSchedule(events), [events]);
}
