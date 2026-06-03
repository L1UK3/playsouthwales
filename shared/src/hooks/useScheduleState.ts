import { useState, useMemo } from 'react';
import { useFetch } from './useFetch';
import { createLeagueMap, filterAndGroupEvents } from '../utils/dataProcessing';
import { getLocalDateString } from '../utils/getLocalDateString';

export type ViewMode = 'calendar' | 'list';

export function useScheduleState() {
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

    return {
        currentDate,
        selectedDateKey,
        setSelectedDateKey,
        viewMode,
        filters,
        direction,
        leagues,
        types,
        allEvents,
        leagueMap,
        filteredEventsGrouped,
        selectedDayEvents,
        handlePrevMonth,
        handleNextMonth,
        handleGoToToday,
        handleToggleViewMode,
        handleFilterChange,
        handleClearFilters
    };
}
