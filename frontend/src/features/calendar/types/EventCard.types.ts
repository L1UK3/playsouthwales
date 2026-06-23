import type { Event } from '@/types/Event';
import type { EventTypeMap } from '@/types/EventTypeMap';
import type { League } from '@/types/League';

/**
 * @interface EventCardProps
 * @description Props for the EventCard components.
 * @property {Event} event - The event data to display.
 * @property {Record<number, League>} leagueMap - A mapping of league IDs to league details for branding.
 * @property {EventTypeMap} types - A mapping of event type keys to their display names or icons.
 */
export interface EventCardProps {
    event: Event;
    leagueMap: Record<number, League>;
    types: EventTypeMap;
}
