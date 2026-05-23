import type { Event } from '@/types/Event';
import type { League } from '@/types/League';
import type { EventTypes } from '@/types/EventTypes';

/**
 * Properties for the ListEventCard component.
 * @property event - The event data to display.
 * @property leagueMap - A mapping of league IDs to league details for branding.
 * @property types - A mapping of event type keys to their display names or icons.
 * @property isExpanded - Boolean indicating whether the card is currently expanded to show details.
 * @property onToggle - Callback function triggered when the card is clicked to toggle its expansion state.
 */
export interface ListEventCardProps {
    event: Event;
    leagueMap: Record<number, League>;
    types: EventTypes;
    isExpanded: boolean;
    onToggle: () => void;
}
