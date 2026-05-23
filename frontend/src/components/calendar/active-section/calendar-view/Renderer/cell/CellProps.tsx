import type { Event } from '@/types/Event';
import type { League } from '@/types/League';
import type { EventTypes } from '@/types/EventTypes';

/**
 * Properties for the Cell component.
 * @property day - The day of the month to display.
 * @property dateKey - A unique string identifier for the date (YYYY-MM-DD).
 * @property isOtherMonth - Boolean indicating if the day belongs to a different month than the one being viewed.
 * @property eventsForDay - Array of events occurring on this specific day.
 * @property leagueMap - A mapping of league IDs to league details for branding.
 * @property types - A mapping of event type keys to their display names or icons.
 * @property selectedDateKey - The dateKey of the currently selected day.
 * @property todayKey - The dateKey of the current real-world date.
 * @property onSelectDay - Callback function triggered when a cell is clicked.
 */
export interface CellProps {
    day: number;
    dateKey: string;
    isOtherMonth: boolean;
    eventsForDay: Event[];
    leagueMap: Record<number, League>;
    types: EventTypes;
    selectedDateKey: string | null;
    todayKey: string;
    onSelectDay: (dateKey: string) => void;
}
