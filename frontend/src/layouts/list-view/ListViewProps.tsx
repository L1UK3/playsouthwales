import type { Event } from '@types/Event';
import type { League } from '@types/League';
import type { EventTypes } from '@types/EventTypes';

/**
 * Properties for the ListView component.
 * @property currentDate - The currently viewed month and year.
 * @property events - A mapping of date keys (YYYY-MM-DD) to arrays of events for those dates.
 * @property leagueMap - A mapping of league IDs to league details for branding.
 * @property types - A mapping of event type keys to their display names or icons.
 */
export interface ListViewProps {
    currentDate: Date;
    events: Record<string, Event[]>;
    leagueMap: Record<number, League>;
    types: EventTypes;
}
