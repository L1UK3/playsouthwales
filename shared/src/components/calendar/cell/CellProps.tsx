import type { Event } from '../../../types/Event';
import type { League } from '../../../types/League';
import type { EventTypes } from '../../../types/EventTypes';

/**
 * @interface CellProps
 * @description Properties for the Cell component.
 * @property {number} day - The day of the month to display.
 * @property {string} dateKey - The unique key representing the date (e.g., YYYY-MM-DD).
 * @property {boolean} isOtherMonth - Whether the cell belongs to a month other than the one currently being viewed.
 * @property {Event[]} eventsForDay - The list of events occurring on this specific day.
 * @property {Record<number, League>} leagueMap - A mapping of league IDs to league details.
 * @property {EventTypes} types - A mapping of event type keys to their display names or icons.
 * @property {string | null} selectedDateKey - The key of the currently selected date.
 * @property {string} todayKey - The key representing today's date.
 * @property {(dateKey: string) => void} onSelectDay - Callback function triggered when a cell is clicked.
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
