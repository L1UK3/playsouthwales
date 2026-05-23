import type { Event } from '@/types/Event';
import type { League } from '@/types/League';
import type { EventTypes } from '@/types/EventTypes';
import type { CellData } from './CellData';

/**
 * Properties for the CalendarRenderer component.
 * @property cells - Array of cell data objects representing the days to be rendered in the grid.
 * @property events - A mapping of date keys (YYYY-MM-DD) to arrays of events for those dates.
 * @property leagueMap - A mapping of league IDs to league details for branding.
 * @property types - A mapping of event type keys to their display names or icons.
 * @property selectedDateKey - The dateKey of the currently selected day.
 * @property todayKey - The dateKey of the current real-world date.
 * @property onSelectDay - Callback function triggered when a cell is clicked.
 */
export interface CalendarRendererProps {
    cells: CellData[];
    events: Record<string, Event[]>;
    leagueMap: Record<number, League>;
    types: EventTypes;
    selectedDateKey: string | null;
    todayKey: string;
    onSelectDay: (dateKey: string) => void;
}
