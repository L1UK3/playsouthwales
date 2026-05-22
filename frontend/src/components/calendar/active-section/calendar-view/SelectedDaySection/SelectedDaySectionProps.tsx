import type { Event, League, EventTypes } from '../../../types';

export interface SelectedDaySectionProps {
    selectedDateKey: string | null;
    selectedDayEvents: Event[];
    leagueMap: Record<number, League>;
    types: EventTypes;
}
