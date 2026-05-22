import { useState, useEffect, useMemo } from 'react';
import type { Event, League, EventTypes } from './types';
import { fetchAndCache, loadLeagues, loadTypes, getLocalDateString, getAllCachedEvents } from './utils/api';
import { MONTH_NAMES } from './constant';
import Filters from './components/calendar/filters/Filters';
import CalendarView from './components/calendar/calendar-view/CalendarView';
import ListView from './components/calendar/list-view/ListView';
import EventCard from './components/event-card/EventCard';
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

      // Use fetchAndCache with a callback to sync the cache into React state
      await fetchAndCache(month, year, 1, (updatedEvents) => {
        setAllEvents(updatedEvents);
      });

      // Also ensure state is updated with initial fetch result even if callback isn't triggered (e.g. cache hit)
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
      <header>
        <div className="top-nav">
          <h1>Play! Wales | {activeTab === 'schedule' ? 'Schedule' : 'Leagues'}</h1>
          <div className="tab-toggle">
            <button
              className={activeTab === 'schedule' ? 'active' : ''}
              onClick={() => setActiveTab('schedule')}
            >Schedule</button>
            <button
              className={activeTab === 'leagues' ? 'active' : ''}
              onClick={() => setActiveTab('leagues')}
            >Leagues</button>
          </div>
          <div className="config-tabs">
            <button className="admin-button">Admin</button>
            <button className="settings-button">⚙️</button>
          </div>
        </div>
      </header>

      <main className="app-container">
        {activeTab === 'schedule' ? (
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

            {viewMode === 'calendar' ? (
              <div className="calendar-container active">
                <CalendarView
                  currentDate={currentDate}
                  events={filteredEventsGrouped}
                  leagueMap={leagueMap}
                  types={types}
                  selectedDateKey={selectedDateKey}
                  onSelectDay={setSelectedDateKey}
                />

                {selectedDateKey && (
                  <div className="selected-day-section active animate-fade-down">
                    <div className="event-list-title">
                      {new Date(selectedDateKey + 'T00:00:00').toLocaleDateString(undefined, {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </div>
                    <div className="event-list">
                      {selectedDayEvents.length === 0 ? (
                        <div className="no-events">No events scheduled for this day.</div>
                      ) : (
                        selectedDayEvents.map(event => (
                          <EventCard key={event.id} event={event} leagueMap={leagueMap} types={types} />
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="calendar-container active">
                <ListView
                  currentDate={currentDate}
                  events={filteredEventsGrouped}
                  leagueMap={leagueMap}
                  types={types}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="tab-content active">
            <div className="leagues-container">
              {leagues.map(league => (
                <div key={league.leagueId} className="league-card">
                  <h3>{league.name}</h3>
                  {league.website && <a href={league.website} target="_blank" rel="noopener noreferrer">Website</a>}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
