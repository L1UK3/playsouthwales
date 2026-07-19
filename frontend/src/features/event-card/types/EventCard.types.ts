import type { Event } from '@/types/Event';
import type { League } from '@/types/League';
import type { EventTypeMap } from '@/types/EventTypeMap';

/**
 * Common properties for all event card components (ScheduleCard, ListCard, CalendarCard).
 * @param event {Event} - The event object containing event details.
 * @param leagueMap {Record<number, League>} - A mapping of league IDs to League objects.
 * @param types {EventTypeMap} - A mapping of event types to their corresponding properties.
 */
export interface EventCardProps {
    event: Event;
    leagueMap: Record<number, League>;
    types: EventTypeMap;
}

/**
 * Additional visual states that can be forced on event cards.
 * @param state {string} - The visual state to apply to the event card.
 * Can be one of 'default', 'hover', 'focus', 'active', 'disabled', 'loading', 'error', or 'success'.
 */
export interface EventCardAdditionalProps {
    state?: 'default'
    | 'hover'
    | 'focus'
    | 'active'
    | 'disabled'
    | 'loading'
    | 'error'
    | 'success';
}
