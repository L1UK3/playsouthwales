import React from 'react';
import type { Event, League, EventTypes } from '../../types';
import { MONTH_NAMES } from '../../constant';
import Filters from '../../components/calendar/filters/Filters';
import CalendarView from '../../components/calendar/calendar-view/CalendarView';
import ListView from '../../components/calendar/list-view/ListView';
import SelectedDaySection from '../../components/calendar/calendar-view/SelectedDaySection';

interface SchedulePageProps {
    currentDate: Date;
    viewMode: 'calendar' | 'list';
    setViewMode: React.Dispatch<React.SetStateAction<'calendar' | 'list'>>;
    handleGoToToday: () => void;
    handlePrevMonth: () => void;
    handleNextMonth: () => void;
    leagues: League[];
    types: EventTypes;
    filters: { league: string; type: string; game: string };
    handleFilterChange: (name: string, value: string) => void;
    handleClearFilters: () => void;
    filteredEventsGrouped: Record<string, Event[]>;
    leagueMap: Record<number, League>;
    selectedDateKey: string | null;
    setSelectedDateKey: (key: string | null) => void;
    selectedDayEvents: Event[];
}

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
