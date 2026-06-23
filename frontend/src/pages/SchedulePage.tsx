import { MONTH_NAMES } from "@/constants";
import { useEvents, useEventTypes, useLeagues, useDocumentMetadata } from "@/hooks";
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
import SuspenseLoader from "@/components/SuspenseLoader";

export type ViewMode = 'calendar' | 'list';

/**
 * SchedulePage component handles the rendering of the event schedule,
 * providing both calendar and list views along with filtering capabilities.
 * @returns JSX.Element
 */
const SchedulePage: React.FC = () => {
    useDocumentMetadata({
        title: 'Event Schedule',
        description: 'Check the upcoming Pokémon TCG and VGC event schedules, local tournaments, and leagues across Wales.'
    });

    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [selectedDateKey, setSelectedDateKey] = useState<string | null>(() => getLocalDateString(new Date()));
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

    const handleSelectDay = useCallback((dateKey: string) => {
        setSelectedDateKey(prev => prev === dateKey ? null : dateKey);
    }, []);

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

    const prevMonthDate = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1), [currentDate]);
    const nextMonthDate = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1), [currentDate]);

    const { data: leagues = [], isLoading: isLeaguesLoading } = useLeagues();
    const { data: types = {}, isLoading: isTypesLoading } = useEventTypes();

    const { data: currentEvents = [], isLoading: isCurrentEventsLoading } = useEvents(currentDate);
    const { data: prevEvents = [] } = useEvents(prevMonthDate);
    const { data: nextEvents = [] } = useEvents(nextMonthDate);

    const isLoading = isLeaguesLoading || isTypesLoading || isCurrentEventsLoading;

    const allEvents = useMemo(() => {
        return [...prevEvents, ...currentEvents, ...nextEvents];
    }, [prevEvents, currentEvents, nextEvents]);

    const leagueMap = useMemo(() => createLeagueMap(leagues), [leagues]);

    const filteredEventsGrouped = useMemo(
        () => filterAndGroupEvents(allEvents, filters), [allEvents, filters]
    );

    const selectedDayEvents = selectedDateKey ? (filteredEventsGrouped[selectedDateKey] ?? []) : [];

    const activeMonthEvents = useMemo(() => {
        const year = currentDate.getFullYear();
        const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
        const monthKeyPrefix = `${year}-${monthStr}`;
        return allEvents.filter(event => {
            if (!event.date.startsWith(monthKeyPrefix)) return false;
            if (filters.league && String(event.leagueId) !== filters.league) return false;
            if (filters.type && event.type !== filters.type) return false;
            if (filters.game && event.game !== filters.game) return false;
            return true;
        }).sort((a, b) => a.date.localeCompare(b.date) || (a.startTime ?? '').localeCompare(b.startTime ?? ''));
    }, [allEvents, currentDate, filters]);

    const eventsToDisplay = selectedDateKey ? selectedDayEvents : activeMonthEvents;

    const animationClass =
        direction === 'left' ? 'animate-swipe-left' :
            direction === 'right' ? 'animate-swipe-right' :
                direction === 'down' ? 'animate-swipe-down' :
                    direction === 'up' ? 'animate-swipe-up' : '';

    const calendarKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;


    if (isLoading) {
        return <SuspenseLoader message="Loading schedule..." />;
    }

    return (
        <div className="flex flex-col p-0 animate-swipe-up">
            <h1 className="sr-only">Pokémon Events Schedule Wales</h1>
            <div className="flex flex-col gap-3 mb-4 z-10 bg-bg-main p-3.5 rounded-lg border-2 border-border-color shrink-0">
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

            <div className="flex-1 block opacity-100">
                {viewMode === 'calendar' ? (
                    <div key={calendarKey} className={`${animationClass}`}>
                        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-stretch">
                            <div className="flex-1 min-w-0 lg:flex lg:flex-col">
                                <CalendarView
                                    currentDate={currentDate}
                                    events={filteredEventsGrouped}
                                    leagueMap={leagueMap}
                                    types={types}
                                    selectedDateKey={selectedDateKey}
                                    onSelectDay={handleSelectDay}
                                />
                            </div>
                            <div className="lg:relative lg:flex-[0_0_400px] lg:max-w-100 w-full lg:w-auto">
                                <SelectedDaySection
                                    selectedDateKey={selectedDateKey}
                                    selectedDayEvents={eventsToDisplay}
                                    currentDate={currentDate}
                                    leagueMap={leagueMap}
                                    types={types}
                                />
                            </div>
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
