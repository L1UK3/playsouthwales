import type { Event } from '@/types/Event';
import type { League } from '@/types/League';
import type { EventTypes } from '@/types/EventTypes';

export interface ListViewProps {
    currentDate: Date;
    events: Record<string, Event[]>;
    leagueMap: Record<number, League>;
    types: EventTypes;
}
