import type { Event, League, EventTypes } from '../../../types';

export interface ListEventGroupProps {
    dateKey: string;
    eventsForDay: Event[];
    leagueMap: Record<number, League>;
    types: EventTypes;
    expandedEventId: number | null;
    onToggleEvent: (eventId: number) => void;
}
