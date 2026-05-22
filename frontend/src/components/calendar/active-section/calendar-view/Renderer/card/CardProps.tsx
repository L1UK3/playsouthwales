import type { Event, League, EventTypes } from '../../../types';

export interface CardProps {
    event: Event;
    leagueMap: Record<number, League>;
    types: EventTypes;
}
