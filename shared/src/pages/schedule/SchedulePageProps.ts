import type { Event } from '../../types/Event';
import type { EventTypes } from "../../types/EventTypes";
import type { League } from "../../types/League";

/**
 * Properties for the SchedulePage component, managing the display of events in calendar or list view.
 * @interface SchedulePageProps
 * @description Defines the state and handlers required to render the schedule interface, including navigation, filtering, and event selection.
 
 * @property {Date} currentDate - The currently active date being viewed.
 * @property {'calendar' | 'list'} viewMode - The current display mode of the schedule.
 * @property {() => void} handleToggleViewMode - Function to switch between calendar and list views.
 * @property {() => void} handleGoToToday - Function to reset the view to the current date.
 * @property {() => void} handlePrevMonth - Function to navigate to the previous month.
 * @property {() => void} handleNextMonth - Function to navigate to the next month.
 * @property {'left' | 'right' | 'up' | 'down' | null} direction - The animation direction for transitions.
 * @property {League[]} leagues - List of all available leagues for filtering.
 * @property {EventTypes} types - Mapping of event types for filtering and display.
 * @property {Object} filters - The current filter state for league, type, and game.
 * @property {(name: string, value: string) => void} handleFilterChange - Callback to update a specific filter.
 * @property {() => void} handleClearFilters - Function to reset all active filters.
 * @property {Record<string, Event[]>} filteredEventsGrouped - Events filtered and grouped by date string.
 * @property {Record<number, League>} leagueMap - A lookup map for league details by ID.
 * @property {string | null} selectedDateKey - The date string of the currently selected day.
 * @property {(key: string | null) => void} setSelectedDateKey - Function to update the selected day.
 * @property {Event[]} selectedDayEvents - The list of events occurring on the selected date.
 */
export interface SchedulePageProps {
    currentDate: Date;
    viewMode: 'calendar' | 'list';
    handleToggleViewMode: () => void;
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
