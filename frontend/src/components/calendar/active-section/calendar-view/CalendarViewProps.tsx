import type { Event, League, EventTypes } from '../../../types';

export interface CalendarViewProps {
    currentDate: Date;
    events: Record<string, Event[]>;
    leagueMap: Record<number, League>;
    types: EventTypes;
    selectedDateKey: string | null;
    onSelectDay: (dateKey: string) => void;
}
