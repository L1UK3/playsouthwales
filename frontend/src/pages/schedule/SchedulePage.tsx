import { MONTH_NAMES } from "@/constants";
import { useEvents, useEventTypes, useLeagues } from "@/hooks";
import {
    CalendarView,
    createLeagueMap,
    filterAndGroupEvents,
    Filters,
    getLocalDateString,
    ListView,
    NavBar,
    SelectedDaySection
} from "@calendar";
import { useCallback, useMemo, useState } from "react";
import styles from './SchedulePage.module.css';

export type ViewMode = 'calendar' | 'list';

/**
 * SchedulePage component handles the rendering of the event schedule,
 * providing both calendar and list views along with filtering capabilities.
 * @returns JSX.Element
 */
const SchedulePage: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('calendar');
    const [filters, setFilters] = useState({ league: '', type: '', game: '' });
    const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);

    const handlePrevMonth = useCallback(() => {
        setDirection('right');
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        setSelectedDateKey(null);
    }, []);

    const handleNextMonth = useCallback(() => {
        setDirection('left');
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        setSelectedDateKey(null);
    }, []);

    const handleGoToToday = useCallback(() => {
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
    }, [currentDate]);

    const handleToggleViewMode = useCallback(() => {
        setDirection('down');
        setViewMode(prev => prev === 'calendar' ? 'list' : 'calendar');
    }, []);

    const handleFilterChange = useCallback((name: string, value: string) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters({ league: '', type: '', game: '' });
    }, []);

    const { data: leagues = [] } = useLeagues();
    const { data: types = {} } = useEventTypes();
    const { data: allEvents = [] } = useEvents(currentDate);

    const leagueMap = useMemo(() => createLeagueMap(leagues), [leagues]);

    const filteredEventsGrouped = useMemo(
        () => filterAndGroupEvents(allEvents, filters), [allEvents, filters]
    );

    const selectedDayEvents = selectedDateKey ? (filteredEventsGrouped[selectedDateKey] ?? []) : [];

    const animationClass =
        direction === 'left' ? 'animate-swipe-left' :
            direction === 'right' ? 'animate-swipe-right' :
                direction === 'down' ? 'animate-swipe-down' :
                    direction === 'up' ? 'animate-swipe-up' : '';

    const calendarKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;


    return (
        <div className={`${styles.tabContent} ${styles.active} animate-swipe-up`}>
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
                        <div className={styles.scheduleSplit}>
                            <div className={styles.calendarColumn}>
                                <CalendarView
                                    currentDate={currentDate}
                                    events={filteredEventsGrouped}
                                    leagueMap={leagueMap}
                                    types={types}
                                    selectedDateKey={selectedDateKey}
                                    onSelectDay={setSelectedDateKey}
                                />
                            </div>
                            <SelectedDaySection
                                selectedDateKey={selectedDateKey}
                                selectedDayEvents={selectedDayEvents}
                                leagueMap={leagueMap}
                                types={types}
                            />
                        </div>
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
