import React from 'react';
import { MONTH_NAMES } from '../../constant';
import Filters from '../../components/calendar/filters/Filters';
import CalendarView from '../../components/calendar/active-section/calendar-view/CalendarView';
import ListView from '../../components/calendar/active-section/list-view/ListView';
import SelectedDaySection from '../../components/calendar/active-section/calendar-view/SelectedDaySection/SelectedDaySection';
import type { SchedulePageProps } from './SchedulePageProps';

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
        <div className="tab-content active">
            <div className="schedule-header">
                <div className="controls">
                    <h2>{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                    <button onClick={handleGoToToday}>Today</button>
                    <button onClick={handlePrevMonth}>&larr;</button>
                    <button onClick={handleNextMonth}>&rarr;</button>
                    <button className="calendar-toggle" onClick={() => setViewMode(v => v === 'calendar' ? 'list' : 'calendar')}>
                        Switch to {viewMode === 'calendar' ? 'List' : 'Calendar'}
                    </button>
                </div>

                <Filters
                    leagues={leagues}
                    types={types}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClear={handleClearFilters}
                />
            </div>

            <div className="calendar-container active">
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
