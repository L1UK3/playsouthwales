import { useState } from 'react';
import { getLocalDateString } from "../utils/getLocalDateString";

export type ViewMode = 'calendar' | 'list';
export type ActiveTab = 'schedule' | 'leagues';

/**
 * Centralizes the application's core state and navigation logic.
 * 
 * Manages state for:
 * - Current date and month navigation.
 * - Selected date for event details.
 * - View modes (calendar vs list).
 * - Active navigation tabs (schedule vs leagues).
 * - Event filtering criteria.
 * 
 * @returns An object containing state values and handler functions to manipulate the application state.
 */
export function useAppLogic() {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
	const [viewMode, setViewMode] = useState<ViewMode>('calendar');
	const [activeTab, setActiveTab] = useState<ActiveTab>('schedule');
	const [filters, setFilters] = useState({ league: '', type: '', game: '' });

	/**
	 * Navigates the calendar to the previous month and clears the selected date.
	 */
	const handlePrevMonth = () => {
		setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
		setSelectedDateKey(null);
	};

	/**
	 * Navigates the calendar to the next month and clears the selected date.
	 */
	const handleNextMonth = () => {
		setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
		setSelectedDateKey(null);
	};

	/**
	 * Resets the calendar to the current month and selects today's date.
	 */
	const handleGoToToday = () => {
		const today = new Date();
		setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
		setSelectedDateKey(getLocalDateString(today));
	};

	/**
	 * Updates a specific filter value (league, type, or game) in the state.
	 * @param name - The name of the filter to update.
	 * @param value - The new value to set for the filter.
	 */
	const handleFilterChange = (name: string, value: string) => {
		setFilters(prev => ({ ...prev, [name]: value }));
	};

	/**
	 * Clears all active filters.
	 */
	const handleClearFilters = () => {
		setFilters({ league: '', type: '', game: '' });
	};

	return {
		currentDate,
		setCurrentDate,
		selectedDateKey,
		setSelectedDateKey,
		viewMode,
		setViewMode,
		activeTab,
		setActiveTab,
		filters,
		handlePrevMonth,
		handleNextMonth,
		handleGoToToday,
		handleFilterChange,
		handleClearFilters,
	};
}
