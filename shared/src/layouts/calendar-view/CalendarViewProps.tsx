import type { Event, League, EventTypes } from '@playwales/shared';

/**
 * Properties for the CalendarView component.
 * @property currentDate - The currently viewed month and year.
 * @property events - A mapping of date keys (YYYY-MM-DD) to arrays of events for those dates.
 * @property leagueMap - A mapping of league IDs to league details for branding.
 * @property types - A mapping of event type keys to their display names or icons.
 * @property selectedDateKey - The dateKey of the currently selected day.
 * @property onSelectDay - Callback function triggered when a day is selected.
 */
export interface CalendarViewProps {
    currentDate: Date;
    events: Record<string, Event[]>;
    leagueMap: Record<number, League>;
    types: EventTypes;
    selectedDateKey: string | null;
    onSelectDay: (dateKey: string) => void;
}