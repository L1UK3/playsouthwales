import { useMemo, useState } from 'react';
import { createLeagueMap, filterAndGroupEvents } from "./utils/dataProcessing";
import { useFetch } from './hooks/useFetch';
import { useOverlay } from './hooks/useOverlay';
import Header from './layouts/header/Header';
import LoginBox from './components/login/LoginBox';
import SchedulePage from './pages/schedule/SchedulePage';
import LeaguesPage from './pages/leagues/LeaguesPage';
import styles from './App.module.css';
import { getLocalDateString } from './utils/getLocalDateString';

export type ViewMode = 'calendar' | 'list';
export type ActiveTab = 'schedule' | 'leagues';

/**
 * Main application component that orchestrates the state, data fetching, 
 * and routing between the Schedule and Leagues pages.
 * @returns {JSX.Element} The rendered application component.
 */
function App() {
	// State (UI & Logic Hook)
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

	// State (Data Fetching Hook)
	const { leagues, types, allEvents } = useFetch(currentDate);

	// Derived Data (Mappings & Filtering)
	const leagueMap = useMemo(() => createLeagueMap(leagues), [leagues]);

	const filteredEventsGrouped = useMemo(
		() => filterAndGroupEvents(allEvents, filters), [allEvents, filters]
	);

	const selectedDayEvents = selectedDateKey ? (filteredEventsGrouped[selectedDateKey] || []) : [];

	// Overlay State
	const {
		isLoginOpen, handleLoginBox, handleCloseLogin,
		isSettingsOpen, handleSettingsBox, handleCloseSettings,
	} = useOverlay();

	return (
		<div className={styles.appRoot}>
			<Header
				activeTab={activeTab}
				onTabChange={setActiveTab}
				onLoginBox={handleLoginBox}
				onSettingsBox={handleSettingsBox}
				isSettingsOpen={isSettingsOpen}
				onCloseSettings={handleCloseSettings}
			/>
			{isLoginOpen && <LoginBox onClose={handleCloseLogin} />}

			<main className={styles.appContainer}>
				{activeTab === 'schedule' ? (
					<SchedulePage
						currentDate={currentDate}
						viewMode={viewMode}
						handleToggleViewMode={handleToggleViewMode}
						handleGoToToday={handleGoToToday}
						handlePrevMonth={handlePrevMonth}
						handleNextMonth={handleNextMonth}
						direction={direction}
						leagues={leagues}
						types={types}
						filters={filters}
						handleFilterChange={handleFilterChange}
						handleClearFilters={handleClearFilters}
						filteredEventsGrouped={filteredEventsGrouped}
						leagueMap={leagueMap}
						selectedDateKey={selectedDateKey}
						setSelectedDateKey={setSelectedDateKey}
						selectedDayEvents={selectedDayEvents}
					/>
				) : (
					<LeaguesPage leagues={leagues} />
				)}
			</main>
		</div>
	);
}

export default App;
