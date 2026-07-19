import type { Event } from '@/types/Event';
import type { League } from '@/types/League';
import type { EventTypeMap } from '@/types/EventTypeMap';

/**
 * Common properties for all event card components (ScheduleCard, ListCard, CalendarCard).
 */
export interface EventCardProps {
    event: Event;
    leagueMap: Record<number, League>;
    types: EventTypeMap;
}

/**
 * Additional visual states that can be forced on event cards.
 */
export interface EventCardAdditionalProps {
    state?:
        | 'default'
        | 'hover'
        | 'focus'
        | 'active'
        | 'disabled'
        | 'loading'
        | 'error'
        | 'success';
}
