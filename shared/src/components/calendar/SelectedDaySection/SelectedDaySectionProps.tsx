import type { Event, League, EventTypes } from '@playwales/shared';

/**
 * Properties for the SelectedDaySection component.
 * @property selectedDateKey - The dateKey of the currently selected day (YYYY-MM-DD).
 * @property selectedDayEvents - Array of events occurring on the selected day.
 * @property leagueMap - A mapping of league IDs to league details for branding.
 * @property types - A mapping of event type keys to their display names or icons.
 */
export interface SelectedDaySectionProps {
    selectedDateKey: string | null;
    selectedDayEvents: Event[];
    leagueMap: Record<number, League>;
    types: EventTypes;
}
