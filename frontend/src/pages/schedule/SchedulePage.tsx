import React, { useState, useMemo } from 'react';
import styles from './SchedulePage.module.css';
import { useFetch } from '@hooks/useFetch';
import { createLeagueMap, filterAndGroupEvents } from '@/features/calendar/utils/dataProcessing';
import { getLocalDateString } from '@/features/calendar/utils/getLocalDateString';
import NavBar from '@/features/calendar/components/nav-bar/NavBar';
import { MONTH_NAMES } from '@/constants';
import Filters from '@/features/calendar/components/filters/Filters';
import CalendarView from '@/features/calendar/components/calendar-view/CalendarView';
import SelectedDaySection from '@/features/calendar/components/selected-day-section/SelectedDaySection';
import ListView from '@/features/calendar/components/list-view/ListView';

export type ViewMode = 'calendar' | 'list';

/**
 * SchedulePage component handles the rendering of the event schedule,
 * providing both calendar and list views along with filtering capabilities.
 * @returns JSX.Element
 */
const SchedulePage: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('calendar');
    const [filters, setFilters] = useState({ league: '', type: '', game: '' });
    const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);

    const handlePrevMonth = () => {
        setDirection('right');
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        setSelectedDateKey(null);
    };

    const handleNextMonth = () => {
        setDirection('left');
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        setSelectedDateKey(null);
    };

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

    const handleToggleViewMode = () => {
        setDirection('down');
        setViewMode(prev => prev === 'calendar' ? 'list' : 'calendar');
    };

    const handleFilterChange = (name: string, value: string) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleClearFilters = () => {
        setFilters({ league: '', type: '', game: '' });
    };

    const { leagues, types, allEvents } = useFetch(currentDate);

    const leagueMap = useMemo(() => createLeagueMap(leagues), [leagues]);

    const filteredEventsGrouped = useMemo(
        () => filterAndGroupEvents(allEvents, filters), [allEvents, filters]
    );

    const selectedDayEvents = selectedDateKey ? (filteredEventsGrouped[selectedDateKey] || []) : [];

    const animationClass =
        direction === 'left' ? 'animate-swipe-left' :
            direction === 'right' ? 'animate-swipe-right' :
                direction === 'down' ? 'animate-swipe-down' :
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
