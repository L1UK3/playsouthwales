import type { EventTypeMap, League, ScheduleEvent } from "#/types/domain";

/**
 * Common properties for all event card components (ScheduleCard, ListCard, CalendarCard).
 * @param event {Event} - The event object containing event details.
 * @param leagueMap {Record<number, League>} - A mapping of league IDs to League objects.
 * @param types {EventTypeMap} - A mapping of event types to their corresponding properties.
 */
export interface EventCardProps {
	event: ScheduleEvent;
	leagueMap: Record<number, League>;
	types: EventTypeMap;
}
