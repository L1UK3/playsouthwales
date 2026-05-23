import type { Event } from '@/types/Event';
import type { EventTypes } from '@/types/EventTypes';
import type { League } from '@/types/League';

/**
 * Properties for the Card component.
 * @property event - The event data to display.
 * @property leagueMap - A mapping of league IDs to league details for branding.
 * @property types - A mapping of event type keys to their display names or icons.
 */
export interface CardProps {
    event: Event;
    leagueMap: Record<number, League>;
    types: EventTypes;
}
