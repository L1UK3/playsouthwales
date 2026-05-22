import type { Event } from '@/types/Event';
import type { League } from '@/types/League';
import type { EventTypes } from '@/types/EventTypes';
import type { CellData } from './CellData';

export interface CalendarRendererProps {
    cells: CellData[];
    events: Record<string, Event[]>;
    leagueMap: Record<number, League>;
    types: EventTypes;
    selectedDateKey: string | null;
    todayKey: string;
    onSelectDay: (dateKey: string) => void;
}
