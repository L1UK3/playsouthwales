import { useMemo } from 'react';
import { createLeagueMap, filterAndGroupEvents } from "./utils/dataProcessing";
import { useAppLogic } from './hooks/useAppLogic';
import { useFetch } from './hooks/useFetch';
import Header from './layouts/Header/Header';
import SchedulePage from './pages/schedule/SchedulePage';
import LeaguesPage from './pages/leagues/LeaguesPage';
import styles from './App.module.css';
import './App.css';

function App() {
  // State (UI & Logic Hook)
  const {
    currentDate,
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
  } = useAppLogic();

  // State (Data Fetching Hook)
  const { leagues, types, allEvents } = useFetch(currentDate);

  // Derived Data (Mappings & Filtering)
  const leagueMap = useMemo(() => createLeagueMap(leagues), [leagues]);

  const filteredEventsGrouped = useMemo(
    () => filterAndGroupEvents(allEvents, filters),
    [allEvents, filters]
  );

  const selectedDayEvents = selectedDateKey ? (filteredEventsGrouped[selectedDateKey] || []) : [];

  return (
    <div className={styles.appRoot}>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className={styles.appContainer}>
        {activeTab === 'schedule' ? (
          <SchedulePage 
            currentDate={currentDate}
            viewMode={viewMode}
            setViewMode={setViewMode}
            handleGoToToday={handleGoToToday}
            handlePrevMonth={handlePrevMonth}
            handleNextMonth={handleNextMonth}
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
