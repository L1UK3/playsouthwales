import { useMemo } from 'react';
import { createLeagueMap, filterAndGroupEvents } from "./utils/dataProcessing";
import { useAppLogic } from './hooks/useAppLogic';
import { useFetch } from './hooks/useFetch';
import { useOverlay } from './hooks/useOverlay';
import Header from './layouts/Header/Header';
import LoginBox from './components/login/LoginBox';
import SchedulePage from './pages/schedule/SchedulePage';
import LeaguesPage from './pages/leagues/LeaguesPage';
import styles from './App.module.css';

/**
 * Main application component that orchestrates the state, data fetching, 
 * and routing between the Schedule and Leagues pages.
 * @returns JSX.Element
 */
function App() {
	// State (UI & Logic Hook)
	const {
		currentDate,
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
	} = useAppLogic();

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
				toggleSettingsBox={handleSettingsBox}
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
