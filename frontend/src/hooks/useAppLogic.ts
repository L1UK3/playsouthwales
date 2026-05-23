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
	const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);

	/**
	 * Navigates the calendar to the previous month and clears the selected date.
	 */
	const handlePrevMonth = () => {
		setDirection('right');
		setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
		setSelectedDateKey(null);
	};

	/**
	 * Navigates the calendar to the next month and clears the selected date.
	 */
	const handleNextMonth = () => {
		setDirection('left');
		setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
		setSelectedDateKey(null);
	};

	/**
	 * Resets the calendar to the current month and selects today's date.
	 */
	const handleGoToToday = () => {
		const today = new Date();
		const todayMonth = today.getMonth();
		const todayYear = today.getFullYear();
		const currentMonth = currentDate.getMonth();
		const currentYear = currentDate.getFullYear();

		if (todayYear < currentYear || (todayYear === currentYear && todayMonth < currentMonth)) {
			setDirection('right');
		} else if (todayYear > currentYear || (todayYear === currentYear && todayMonth > currentMonth)) {
			setDirection('left');
		} else {
			setDirection(null);
		}

		setCurrentDate(new Date(todayYear, todayMonth, 1));
		setSelectedDateKey(getLocalDateString(today));
	};

	/**
	 * Toggles between calendar and list view modes and sets the animation direction.
	 */
	const handleToggleViewMode = () => {
		setDirection('down');
		setViewMode(prev => prev === 'calendar' ? 'list' : 'calendar');
	};

	/**
	 * Updates a specific filter value (league, type, or game) in the state.
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
		handleToggleViewMode,
		activeTab,
		setActiveTab,
		filters,
		direction,
		handlePrevMonth,
		handleNextMonth,
		handleGoToToday,
		handleFilterChange,
		handleClearFilters,
	};
}
