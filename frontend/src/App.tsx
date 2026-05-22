import { useState, useEffect, useMemo } from 'react';
import type { Event, League, EventTypes } from './types';
import { fetchAndCache, loadLeagues, loadTypes, getLocalDateString, getAllCachedEvents } from './utils/api';
import Header from './layouts/Header';
import SchedulePage from './pages/schedule/SchedulePage';
import LeaguesPage from './pages/leagues/LeaguesPage';
import './App.css';

function App() {
  // State
  const [leagues, setLeagues] = useState<League[]>([]);
  const [types, setTypes] = useState<EventTypes>({});
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [activeTab, setActiveTab] = useState<'schedule' | 'leagues'>('schedule');
  const [filters, setFilters] = useState({ league: '', type: '', game: '' });

  // Initial Data Load
  useEffect(() => {
    const init = async () => {
      try {
        const [leaguesData, typesData] = await Promise.all([loadLeagues(), loadTypes()]);
        setLeagues(leaguesData);
        setTypes(typesData);
      } catch (e) {
        console.error("Initialization failed", e);
      }
    };
    init();
  }, []);

  // Event Loading (on month change)
  useEffect(() => {
    const fetchEvents = async () => {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      await fetchAndCache(month, year, 1, (updatedEvents) => {
        setAllEvents(updatedEvents);
      });

      setAllEvents(getAllCachedEvents());
    };
    fetchEvents();
  }, [currentDate]);

  // Mappings & Filtered Data
  const leagueMap = useMemo(() =>
    leagues.reduce((acc, l) => ({ ...acc, [l.leagueId]: l }), {} as Record<number, League>),
    [leagues]
  );

  const filteredEventsGrouped = useMemo(() => {
    const filtered = allEvents.filter(event => {
      if (filters.league && String(event.leagueId) !== filters.league) return false;
      if (filters.type && event.type !== filters.type) return false;
      if (filters.game && event.game !== filters.game) return false;
      return true;
    });

    return filtered.reduce((acc, event) => {
      const dateKey = event.date.slice(0, 10);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(event);
      return acc;
    }, {} as Record<string, Event[]>);
  }, [allEvents, filters]);

  // Handlers
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

  const selectedDayEvents = selectedDateKey ? (filteredEventsGrouped[selectedDateKey] || []) : [];

  return (
    <div className="app-root">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="app-container">
        {activeTab === 'schedule' ? (
          <SchedulePage 
            currentDate={currentDate}
            viewMode={viewMode}
            setViewMode={setViewMode}
            handleGoToToday={handleGoToToday}
            handlePrevMonth={handlePrevMonth}
            handleNextMonth={handleNextMonth}
            leagues={leagues}
            types={types}
            filters={filters}
            handleFilterChange={handleFilterChange}
            handleClearFilters={handleClearFilters}
            filteredEventsGrouped={filteredEventsGrouped}
            leagueMap={leagueMap}
            selectedDateKey={selectedDateKey}
            setSelectedDateKey={setSelectedDateKey}
            selectedDayEvents={selectedDayEvents}
          />
        ) : (
          <LeaguesPage leagues={leagues} />
        )}
      </main>
    </div>
  );
}

export default App;
