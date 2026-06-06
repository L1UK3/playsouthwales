import type { Event } from '@types/Event';
import type { League } from '@types/League';
import type { EventTypes } from '@types/EventTypes';

/**
 * @interface EventCardProps
 * @description Props for the EventCard components.
 * @property {Event} event - The event data to display.
 * @property {Record<number, League>} leagueMap - A mapping of league IDs to league details for branding.
 * @property {EventTypes} types - A mapping of event type keys to their display names or icons.
 */

export interface EventCardProps {
    event: Event;
    leagueMap: Record<number, League>;
    types: EventTypes;
}
