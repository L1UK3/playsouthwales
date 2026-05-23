import type React from 'react';
import type { Event } from '../../types/Event';
import type { EventTypes } from "@/types/EventTypes";
import type { League } from "@/types/League";

/**
 * Properties for the SchedulePage component, managing the display of events in calendar or list view.
 * 
 * @property currentDate - The currently active date (month/year) for the schedule.
 * @property viewMode - The current layout mode, either 'calendar' or 'list'.
 * @property setViewMode - Function to toggle between calendar and list views.
 * @property handleGoToToday - Resets the view to the current date.
 * @property handlePrevMonth - Navigates to the previous month.
 * @property handleNextMonth - Navigates to the next month.
 * @property leagues - Array of available leagues for filtering.
 * @property types - Dictionary of event types and their associated games.
 * @property filters - Current state of active filters (league, type, game).
 * @property handleFilterChange - Callback to update a specific filter.
 * @property handleClearFilters - Resets all active filters.
 * @property filteredEventsGrouped - Events filtered and grouped by their date string key.
 * @property leagueMap - A mapping of league IDs to their respective League objects.
 * @property selectedDateKey - The date key of the currently selected day in the calendar.
 * @property setSelectedDateKey - Function to update the selected date key.
 * @property selectedDayEvents - List of events occurring on the selected date.
 */
export interface SchedulePageProps {
    currentDate: Date;
    viewMode: 'calendar' | 'list';
    setViewMode: React.Dispatch<React.SetStateAction<'calendar' | 'list'>>;
    handleGoToToday: () => void;
    handlePrevMonth: () => void;
    handleNextMonth: () => void;
    direction: 'left' | 'right' | 'up' | 'down' | null;
    leagues: League[];
    types: EventTypes;
    filters: { league: string; type: string; game: string; };
    handleFilterChange: (name: string, value: string) => void;
    handleClearFilters: () => void;
    filteredEventsGrouped: Record<string, Event[]>;
    leagueMap: Record<number, League>;
    selectedDateKey: string | null;
    setSelectedDateKey: (key: string | null) => void;
    selectedDayEvents: Event[];
}
