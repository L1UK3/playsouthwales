import type { Event, League, EventTypes } from '../../../types';

export interface ListEventCardProps {
    event: Event;
    leagueMap: Record<number, League>;
    types: EventTypes;
    isExpanded: boolean;
    onToggle: () => void;
}
