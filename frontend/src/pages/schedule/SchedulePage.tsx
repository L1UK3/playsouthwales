import React from 'react';
import { MONTH_NAMES } from '../../constant';
import Filters from '../../components/calendar/filters/Filters';
import NavBar from '../../components/calendar/nav-bar/NavBar';
import CalendarView from '../../components/calendar/active-section/calendar-view/CalendarView';
import ListView from '../../components/calendar/active-section/list-view/ListView';
import SelectedDaySection from '../../components/calendar/active-section/calendar-view/SelectedDaySection/SelectedDaySection';
import type { SchedulePageProps } from './SchedulePageProps';
import styles from './SchedulePage.module.css';

const SchedulePage: React.FC<SchedulePageProps> = ({
    currentDate,
    viewMode,
    setViewMode,
    handleGoToToday,
    handlePrevMonth,
    handleNextMonth,
    leagues,
    types,
    filters,
    handleFilterChange,
    handleClearFilters,
    filteredEventsGrouped,
    leagueMap,
    selectedDateKey,
    setSelectedDateKey,
    selectedDayEvents
}) => {
    return (
        <div className={`${styles.tabContent} ${styles.active}`}>
            <div className={styles.scheduleHeader}>
                <NavBar
                    monthName={MONTH_NAMES[currentDate.getMonth()]}
                    year={currentDate.getFullYear()}
                    viewMode={viewMode}
                    onGoToToday={handleGoToToday}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                    onToggleViewMode={() => setViewMode(v => v === 'calendar' ? 'list' : 'calendar')}
                />

                <Filters
                    leagues={leagues}
                    types={types}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClear={handleClearFilters}
                />
            </div>

            <div className={`${styles.calendarContainer} ${styles.active}`}>
                {viewMode === 'calendar' ? (
                    <>
                        <CalendarView
                            currentDate={currentDate}
                            events={filteredEventsGrouped}
                            leagueMap={leagueMap}
                            types={types}
                            selectedDateKey={selectedDateKey}
                            onSelectDay={setSelectedDateKey}
                        />
                        <SelectedDaySection 
                            selectedDateKey={selectedDateKey}
                            selectedDayEvents={selectedDayEvents}
                            leagueMap={leagueMap}
                            types={types}
                        />
                    </>
                ) : (
                    <ListView
                        currentDate={currentDate}
                        events={filteredEventsGrouped}
                        leagueMap={leagueMap}
                        types={types}
                    />
                )}
            </div>
        </div>
    );
};

export default SchedulePage;
