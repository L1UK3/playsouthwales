import { useState, useMemo } from 'react';
import './App.css';
import { CalendarView } from './CalendarView';
import { ListView } from './ListView';
import { useEvents } from './useEvents';
import { getLocalDateString, getCalendarDays } from './calendarUtils';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const TODAY = new Date();

function App() {
  const [currentDate, setCurrentDate] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [currentView, setCurrentView] = useState<'calendar' | 'list'>('calendar');
  const [currentTab, setCurrentTab] = useState<'schedule' | 'leagues'>('schedule');
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const { events, leagues, types } = useEvents(currentDate);

  // Filters
  const [leagueFilter, setLeagueFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [gameFilter, setGameFilter] = useState('');

  // League Map for quick lookup
  const leagueMap = useMemo(() => {
    return leagues.reduce((map, league) => {
      map[league.leagueId] = league;
      return map;
    }, {} as any);
  }, [leagues]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (leagueFilter && String(event.leagueId) !== String(leagueFilter)) return false;
      if (typeFilter && event.type !== typeFilter) return false;
      if (gameFilter && event.game !== gameFilter) return false;
      return true;
    });
  }, [events, leagueFilter, typeFilter, gameFilter]);

  // Group events by date for easy rendering
  const eventsByDate = useMemo(() => {
    return filteredEvents.reduce((acc, event) => {
      const dateKey = event.date ? event.date.slice(0, 10) : null;
      if (!dateKey) return acc;
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(event);
      return acc;
    }, {} as Record<string, any[]>);
  }, [filteredEvents]);

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateKey(getLocalDateString(now));
  };

  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
    setSelectedDateKey(null);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
    setSelectedDateKey(null);
  };

  const clearFilters = () => {
    setLeagueFilter('');
    setTypeFilter('');
    setGameFilter('');
  };

  // Calendar rendering logic
  const calendarDays = useMemo(() => {
    return getCalendarDays(currentDate);
  }, [currentDate]);

  return (
    <div className="root-app">
      <header>
        <div className="top-nav" id="top-nav">
          <h1 id="site-title">
            Play! Wales | {currentTab === 'schedule' ? 'Schedule' : 'Leagues'}
          </h1>
          <div className="tab-toggle" id="tab-toggle">
            <button
              type="button"
              className={`schedule-button ${currentTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setCurrentTab('schedule')}
            >
              Schedule
            </button>
            <button
              type="button"
              className={`leagues-button ${currentTab === 'leagues' ? 'active' : ''}`}
              onClick={() => setCurrentTab('leagues')}
            >
              Leagues
            </button>
          </div>

          <div className="config-tabs" id="confing-tabs">
            <button type="button" className="admin-button" id="admin-button">Admin</button>
            <button type="button" className="settings-button" id="settings-button">
              Settings
            </button>
          </div>
        </div>
      </header>

      <div className="app-container">
        {currentTab === 'schedule' && (
          <div className="tab-content active" id="schedule-view">
            <div className="schedule-header">
              <div className="controls">
                <h2 id="month-title">
                  {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button type="button" onClick={goToToday}>Today</button>
                <button type="button" onClick={prevMonth}>&larr;</button>
                <button type="button" onClick={nextMonth}>&rarr;</button>
                <button
                  className="calendar-toggle"
                  onClick={() => setCurrentView(currentView === 'calendar' ? 'list' : 'calendar')}
                >
                  Switch View
                </button>
              </div>

              <div className="filters" id="view-filters">
                <select value={leagueFilter} onChange={(e) => setLeagueFilter(e.target.value)}>
                  <option value="">All Leagues</option>
                  {leagues.map(l => (
                    <option key={l.leagueId} value={l.leagueId}>{l.name}</option>
                  ))}
                </select>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="">All Event Types</option>
                  {Object.keys(types).map(type => (
                    <option key={type} value={type}>
                      {types[type] ? `[${types[type]}] ${type}` : type}
                    </option>
                  ))}
                </select>
                <select value={gameFilter} onChange={(e) => setGameFilter(e.target.value)}>
                  <option value="">All Games</option>
                  <option value="TCG">TCG</option>
                  <option value="VGC">VGC</option>
                </select>
                <button type="button" className="clear-filters" onClick={clearFilters}>Clear</button>
              </div>
            </div>

            {currentView === 'calendar' ? (
              <CalendarView 
                calendarDays={calendarDays}
                getLocalDateString={getLocalDateString}
                TODAY={TODAY}
                selectedDateKey={selectedDateKey}
                setSelectedDateKey={setSelectedDateKey}
                eventsByDate={eventsByDate}
                leagueMap={leagueMap}
                types={types}
              />
            ) : (
              <ListView 
                eventsByDate={eventsByDate}
                leagueMap={leagueMap}
                types={types}
              />
            )}
          </div>
        )}

        {currentTab === 'leagues' && (
          <div className="tab-content active" id="leagues-view">
            <div className="leagues-header" id="leagues-header"></div>
            <div className="leagues-container" id="leagues-container">
              {leagues.map(league => (
                <div key={league.leagueId} className="league-card">
                  {league.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
