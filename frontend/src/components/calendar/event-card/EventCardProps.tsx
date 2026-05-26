import type { Event } from '@/types/Event';
import type { EventTypes } from '@/types/EventTypes';
import type { League } from '@/types/League';

/**
 * @interface EventCardProps
 * @description Props for the EventCard component.
 * @property {Event} event - The event data to display.
 * @property {Record<number, League>} leagueMap - A mapping of league IDs to league details for branding.
 * @property {EventTypes} types - A mapping of event type keys to their display names or icons.
 * @property {'default' | 'list'} [variant] - The visual style of the card.
 * @property {boolean} [isExpanded] - Whether the card is expanded (used in 'list' variant).
 * @property {() => void} [onToggle] - Callback triggered when toggling the card expansion.
 */

export interface EventCardProps {
    event: Event;
    leagueMap: Record<number, League>;
    types: EventTypes;
    variant?: 'default' | 'list';
    isExpanded?: boolean;
    onToggle?: () => void;
}
