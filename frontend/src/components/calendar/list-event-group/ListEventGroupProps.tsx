import type { Event } from '@types/Event';
import type { League } from '@types/League';
import type { EventTypes } from '@types/EventTypes';

/**
 * Properties for the ListEventGroup component.
 * @property dateKey - A unique string identifier for the date (YYYY-MM-DD).
 * @property eventsForDay - Array of events occurring on this specific day.
 * @property leagueMap - A mapping of league IDs to league details for branding.
 * @property types - A mapping of event type keys to their display names or icons.
 * @property expandedEventId - The ID of the currently expanded event card, or null if none are expanded.
 * @property onToggleEvent - Callback function triggered when an event card is clicked to toggle its expansion.
 */
export interface ListEventGroupProps {
    dateKey: string;
    eventsForDay: Event[];
    leagueMap: Record<number, League>;
    types: EventTypes;
    expandedEventId: number | null;
    onToggleEvent: (eventId: number) => void;
}
