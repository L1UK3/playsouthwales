import { useState } from 'react';
import { getLocalDateString } from "../utils/getLocalDateString";

export type ViewMode = 'calendar' | 'list';
export type ActiveTab = 'schedule' | 'leagues';

export function useAppLogic() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [activeTab, setActiveTab] = useState<ActiveTab>('schedule');
  const [filters, setFilters] = useState({ league: '', type: '', game: '' });

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDateKey(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDateKey(null);
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateKey(getLocalDateString(today));
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ league: '', type: '', game: '' });
  };

  return {
    currentDate,
    setCurrentDate,
    selectedDateKey,
    setSelectedDateKey,
    viewMode,
    setViewMode,
    activeTab,
    setActiveTab,
    filters,
    handlePrevMonth,
    handleNextMonth,
    handleGoToToday,
    handleFilterChange,
    handleClearFilters,
  };
}
