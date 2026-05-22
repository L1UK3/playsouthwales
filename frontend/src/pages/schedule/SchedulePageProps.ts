import type React from 'react';
import type { Event } from '../../types/Event';
import type { EventTypes } from "@/types/EventTypes";
import type { League } from "@/types/League";

export interface SchedulePageProps {
    currentDate: Date;
    viewMode: 'calendar' | 'list';
    setViewMode: React.Dispatch<React.SetStateAction<'calendar' | 'list'>>;
    handleGoToToday: () => void;
    handlePrevMonth: () => void;
    handleNextMonth: () => void;
    leagues: League[];
    types: EventTypes;
    filters: { league: string; type: string; game: string; };
    handleFilterChange: (name: string, value: string) => void;
    handleClearFilters: () => void;
    filteredEventsGrouped: Record<string, Event[]>;
    leagueMap: Record<number, League>;
    selectedDateKey: string | null;
    setSelectedDateKey: (key: string | null) => void;
    selectedDayEvents: Event[];
}
