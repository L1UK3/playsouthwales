/* Hallmark — genre: modern-minimal — macrostructure: Workbench — design-system: design.md — designed-as-app */
import { MONTH_NAMES } from '@/constants';
import {
    useEvents,
    useEventTypeMap,
    useLeagues,
    useDocumentMetadata,
    useSetLegality,
} from '@/hooks';
import {
    CalendarView,
    createLeagueMap,
    filterAndGroupEvents,
    Filters,
    getLocalDateString,
    ListView,
    NavBar,
    SelectedDaySection,
} from '@calendar';
import { useCallback, useMemo, useState } from 'react';
import type { Event } from '@/types/Event';
import SuspenseLoader from '@/components/SuspenseLoader';

// TODO: #46 Properly implement this page using React Native.

export type ViewMode = 'calendar' | 'list';

/**
 * SchedulePage component handles the rendering of the event schedule,
 * providing both calendar and list views along with filtering capabilities.
 * @returns JSX.Element
 */
const SchedulePage: React.FC = () => {
    useDocumentMetadata({
        title: 'Event Schedule',
        description:
            'Check the upcoming TCG and VGC event schedules, local tournaments, and leagues across South Wales.',
    });

    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [selectedDateKey, setSelectedDateKey] = useState<string | null>(() =>
        getLocalDateString(new Date())
    );
    const [viewMode, setViewMode] = useState<ViewMode>('calendar');
    const [filters, setFilters] = useState({
        league: '',
        eventType: '',
        game: '',
    });
    const { data: sets = [] } = useSetLegality();

    const virtualLegalityEvents = useMemo(() => {
        return sets.map((s) => ({
            id: `legality-${s.code}`,
            name: s.name,
            date: s.legalDate,
            startTime: '00:00',
            leagueId: -1,
            eventType: 'LEGALITY',
            game: 'TCG',
            description: `Official standard legality date for ${s.name} (${s.code}).`,
            entryFee: 'N/A',
        }));
    }, [sets]);

    const virtualReleaseEvents = useMemo(() => {
        return sets.map((s) => ({
            id: `release-${s.code}`,
            name: s.name,
            date: s.releaseDate,
            startTime: '00:00',
            leagueId: -1,
            eventType: 'RELEASE',
            game: 'TCG',
            description: `Official English release date for ${s.name} (${s.code}).`,
            entryFee: 'N/A',
        }));
    }, [sets]);
    const [direction, setDirection] = useState<
        'left' | 'right' | 'up' | 'down' | null
    >('up');

    const handlePrevMonth = useCallback(() => {
        setDirection('right');
        setCurrentDate(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
        );
        setSelectedDateKey(null);
    }, []);

    const handleNextMonth = useCallback(() => {
        setDirection('left');
        setCurrentDate(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
        );
        setSelectedDateKey(null);
    }, []);

    const handleGoToToday = useCallback(() => {
        const today = new Date();
        const todayMonth = today.getMonth();
        const todayYear = today.getFullYear();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        if (
            todayYear < currentYear ||
            (todayYear === currentYear && todayMonth < currentMonth)
        ) {
            setDirection('right');
        } else if (
            todayYear > currentYear ||
            (todayYear === currentYear && todayMonth > currentMonth)
        ) {
            setDirection('left');
        } else {
            setDirection(null);
        }

        setCurrentDate(new Date(todayYear, todayMonth, 1));
        setSelectedDateKey(getLocalDateString(today));
    }, [currentDate]);

    const handleSelectDay = useCallback((dateKey: string) => {
        setSelectedDateKey((prev) => {
            const nextVal = prev === dateKey ? null : dateKey;
            if (nextVal !== null) {
                setTimeout(() => {
                    if (window.innerWidth < 1024) {
                        const element = document.getElementById(
                            'selected-day-section'
                        );
                        if (element) {
                            element.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                            });
                        }
                    }
                }, 100);
            }
            return nextVal;
        });
    }, []);

    const handleToggleViewMode = useCallback(() => {
        setDirection('down');
        const changeMode = () =>
            setViewMode((prev) => (prev === 'calendar' ? 'list' : 'calendar'));
        if (document.startViewTransition) {
            document.startViewTransition(changeMode);
        } else {
            changeMode();
        }
    }, []);

    const handleFilterChange = useCallback((name: string, value: string) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters({ league: '', eventType: '', game: '' });
    }, []);

    const prevMonthDate = useMemo(
        () =>
            new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
        [currentDate]
    );
    const nextMonthDate = useMemo(
        () =>
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
        [currentDate]
    );

    const { data: leagues = [], isLoading: isLeaguesLoading } = useLeagues();
    const { data: types = {}, isLoading: isTypesLoading } = useEventTypeMap();

    const { data: currentEvents = [], isLoading: isCurrentEventsLoading } =
        useEvents(currentDate);
    const { data: prevEvents = [] } = useEvents(prevMonthDate);
    const { data: nextEvents = [] } = useEvents(nextMonthDate);

    const isLoading =
        isLeaguesLoading || isTypesLoading || isCurrentEventsLoading;

    const allEvents = useMemo(() => {
        return [
            ...prevEvents,
            ...currentEvents,
            ...nextEvents,
            ...virtualLegalityEvents,
            ...virtualReleaseEvents,
        ];
    }, [
        prevEvents,
        currentEvents,
        nextEvents,
        virtualLegalityEvents,
        virtualReleaseEvents,
    ]);

    const leagueMap = useMemo(() => createLeagueMap(leagues), [leagues]);

    const filteredEventsGrouped = useMemo(
        () => filterAndGroupEvents(allEvents, filters),
        [allEvents, filters]
    );

    const filteredEventsGroupedList = useMemo(() => {
        const result: Record<string, Event[]> = {};
        for (const [date, list] of Object.entries(filteredEventsGrouped)) {
            const filtered = list.filter(
                (e) => e.eventType !== 'LEGALITY' && e.eventType !== 'RELEASE'
            );
            if (filtered.length > 0) {
                result[date] = filtered;
            }
        }
        return result;
    }, [filteredEventsGrouped]);

    const selectedDayEventsFiltered = useMemo(() => {
        const dayEvents = selectedDateKey
            ? (filteredEventsGrouped[selectedDateKey] ?? [])
            : [];
        return dayEvents.filter(
            (e) => e.eventType !== 'LEGALITY' && e.eventType !== 'RELEASE'
        );
    }, [selectedDateKey, filteredEventsGrouped]);

    const activeMonthEvents = useMemo(() => {
        const year = currentDate.getFullYear();
        const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
        const monthKeyPrefix = `${year}-${monthStr}`;
        return allEvents
            .filter((event) => {
                if (
                    event.eventType === 'LEGALITY' ||
                    event.eventType === 'RELEASE'
                )
                    return false;
                if (!event.date.startsWith(monthKeyPrefix)) return false;
                if (filters.league && String(event.leagueId) !== filters.league)
                    return false;
                if (filters.eventType && event.eventType !== filters.eventType)
                    return false;
                if (filters.game && event.game !== filters.game) return false;
                return true;
            })
            .sort(
                (a, b) =>
                    a.date.localeCompare(b.date) ??
                    (a.startTime ?? '').localeCompare(b.startTime ?? '')
            );
    }, [allEvents, currentDate, filters]);

    const eventsToDisplay = selectedDateKey
        ? selectedDayEventsFiltered
        : activeMonthEvents;

    const animationClass =
        direction === 'left'
            ? 'animate-swipe-left'
            : direction === 'right'
              ? 'animate-swipe-right'
              : direction === 'down'
                ? 'animate-swipe-down'
                : direction === 'up'
                  ? 'animate-swipe-up'
                  : '';

    const calendarKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

    return (
        <>
            <div className="flex flex-col p-0 animate-swipe-up">
                <h1 className="sr-only">Events Schedule South Wales</h1>
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
                    {isLoading ? (
                        <SuspenseLoader message="Loading schedule…" />
                    ) : viewMode === 'calendar' ? (
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
                        <div
                            key={`list-${calendarKey}`}
                            className={animationClass}
                        >
                            <ListView
                                currentDate={currentDate}
                                events={filteredEventsGroupedList}
                                leagueMap={leagueMap}
                                types={types}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SchedulePage;
