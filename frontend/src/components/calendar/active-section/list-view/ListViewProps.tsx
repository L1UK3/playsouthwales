import type { Event, League, EventTypes } from '../../../types';

export interface ListViewProps {
    currentDate: Date;
    events: Record<string, Event[]>;
    leagueMap: Record<number, League>;
    types: EventTypes;
}
