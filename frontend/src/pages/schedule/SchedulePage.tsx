import React from 'react';
import { MONTH_NAMES } from '../../constant';
import Filters from '../../components/calendar/filters/Filters';
import NavBar from '../../components/calendar/nav-bar/NavBar';
import CalendarView from '../../layouts/app-content/calendar-view/CalendarView';
import ListView from '../../layouts/app-content/list-view/ListView';
import SelectedDaySection from '../../components/calendar/SelectedDaySection/SelectedDaySection';
import type { SchedulePageProps } from './SchedulePageProps';
import styles from './SchedulePage.module.css';

/**
 * SchedulePage component handles the rendering of the event schedule,
 * providing both calendar and list views along with filtering capabilities.
 * @param props - The properties passed to the component including state and handlers.
 * @returns JSX.Element
 */
const SchedulePage: React.FC<SchedulePageProps> = ({
    currentDate,
    viewMode,
    handleToggleViewMode,
    handleGoToToday,
    handlePrevMonth,
    handleNextMonth,
    direction,
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
    const animationClass = 
        direction === 'left' ? 'animate-swipe-left' : 
        direction === 'right' ? 'animate-swipe-right' : 
        direction === 'down' ? 'animate-fade-down' : 
        direction === 'up' ? 'animate-swipe-up' : '';
    const calendarKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

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
                    onToggleViewMode={handleToggleViewMode}
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
                    <div key={calendarKey} className={animationClass}>
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
                    </div>
                ) : (
                    <div key={`list-${calendarKey}`} className={animationClass}>
                        <ListView
                            currentDate={currentDate}
                            events={filteredEventsGrouped}
                            leagueMap={leagueMap}
                            types={types}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchedulePage;
