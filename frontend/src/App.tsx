import { useState, useEffect, useMemo } from 'react';
import './App.css';

// Constants
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const TODAY = new Date();

function App() {
  const [currentDate, setCurrentDate] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [events, setEvents] = useState<any[]>([]);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [types, setTypes] = useState<Record<string, string>>({});
  const [currentView, setCurrentView] = useState<'calendar' | 'list'>('calendar');
  const [currentTab, setCurrentTab] = useState<'schedule' | 'leagues'>('schedule');
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  // Filters
  const [leagueFilter, setLeagueFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [gameFilter, setGameFilter] = useState('');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaguesRes, typesRes] = await Promise.all([
          fetch('/leagues'),
          fetch('/types')
        ]);
        if (leaguesRes.ok) setLeagues(await leaguesRes.json());
        if (typesRes.ok) setTypes(await typesRes.json());
      } catch (e) {
        console.error("Failed to fetch initial data", e);
      }
    };
    fetchData();
  }, []);

  // Fetch events when month/year changes
  useEffect(() => {
    const fetchEvents = async () => {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      try {
        const res = await fetch(`/events?month=${month}&year=${year}`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (e) {
        console.error("Failed to fetch events", e);
      }
    };
    fetchEvents();
  }, [currentDate]);

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

  // Helper functions
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const startDay = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];

    // Prev month padding
    for (let i = startDay - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const date = new Date(year, month - 1, dayNum);
      days.push({ dayNum, date, isOtherMonth: true });
    }

    // Current month
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const date = new Date(year, month, dayNum);
      days.push({ dayNum, date, isOtherMonth: false });
    }

    // Next month padding
    const totalCells = days.length;
    const remainingCells = (Math.ceil(totalCells / 7) * 7) - totalCells;
    for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
      const date = new Date(year, month + 1, dayNum);
      days.push({ dayNum, date, isOtherMonth: true });
    }

    return days;
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
              <div className="calendar-container active" id="calendar-view">
                <div className="calendar">
                  <div className="days-of-week">
                    <div className="day-name">Mon</div>
                    <div className="day-name">Tue</div>
                    <div className="day-name">Wed</div>
                    <div className="day-name">Thu</div>
                    <div className="day-name">Fri</div>
                    <div className="day-name">Sat</div>
                    <div className="day-name">Sun</div>
                  </div>

                  <div className="calendar-grid" id="calendar-grid">
                    {calendarDays.map((day, idx) => {
                      const dateKey = getLocalDateString(day.date);
                      const isToday = dateKey === getLocalDateString(TODAY);
                      const isSelected = dateKey === selectedDateKey;
                      const dayEvents = eventsByDate[dateKey] || [];

                      return (
                        <div
                          key={idx}
                          className={`calendar-cell ${day.isOtherMonth ? 'empty' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                          onClick={() => !day.isOtherMonth && setSelectedDateKey(dateKey)}
                        >
                          <div className="date-number">{day.dayNum}</div>
                          {dayEvents.length > 0 && (
                            <div className="event-list">
                              {dayEvents.slice(0, 2).map((event: any, eIdx: number) => {
                                const league = leagueMap[event.leagueId];
                                const storeColor = league?.brandColor || `hsl(${(event.leagueId || 0) * 137 % 360}, 70%, 50%)`;
                                return (
                                  <div
                                    key={eIdx}
                                    className={`event type-${event.type}`}
                                    style={{ '--store-color': storeColor } as any}
                                  >
                                    <span>{event.leagueName || 'Event'}</span>
                                    <span className="type">{types[event.type] || event.type}</span>
                                  </div>
                                );
                              })}
                              {dayEvents.length > 2 && (
                                <div className="event-summary">
                                  {dayEvents.length - 2} more event{dayEvents.length - 2 === 1 ? '' : 's'}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedDateKey && (
                  <div id="selected-day-section" className="selected-day-section active">
                    <div id="selected-day-title" className="event-list-title">
                      {new Date(selectedDateKey + 'T00:00:00').toLocaleDateString(undefined, {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </div>
                    <div id="selected-day-events" className="event-list">
                      {(eventsByDate[selectedDateKey] || []).length === 0 ? (
                        <div className="no-events">No events scheduled for this day.</div>
                      ) : (
                        (eventsByDate[selectedDateKey] || []).map((event: any, idx: number) => {
                          const league = leagueMap[event.leagueId];
                          const storeColor = league?.brandColor || `hsl(${(event.leagueId || 0) * 137 % 360}, 70%, 50%)`;
                          return (
                            <div
                              key={idx}
                              className={`event-card type-${event.type}`}
                              style={{ '--store-color': storeColor } as any}
                            >
                              <div className="event-card-content">
                                <div className="event-card-header">
                                  <div className="event-card-store">{event.name}</div>
                                  <div className="event-card-type">{types[event.type] ? types[event.type] + ' ' : ''}{event.type} • {event.game}</div>
                                </div>
                                <div className="event-card-details">
                                  <div className="event-card-league">{league?.name || event.leagueName || 'No League'}</div>
                                  <div className="event-card-time">{event.startTime || ''} {event.entryFee ? '• ' + event.entryFee : ''}</div>
                                </div>
                                {event.description && <div className="event-card-description">{event.description}</div>}
                                {event.prizes && <div className="event-card-prizes"><strong>Prizes:</strong> {event.prizes}</div>}
                                {event.ticketLink && (
                                  <a href={event.ticketLink} className="event-card-link" target="_blank" rel="noreferrer">Tickets & Info</a>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="calendar-container active" id="list-view">
                <div id="list-view-events" className="event-list">
                  {Object.keys(eventsByDate).sort().length === 0 ? (
                    <div className="list-no-events">No events found.</div>
                  ) : (
                    Object.keys(eventsByDate).sort().map(dateKey => (
                      <div key={dateKey} className="list-events-group">
                        <div className="list-group-date">
                          {new Date(dateKey + 'T00:00:00').toLocaleDateString(undefined, {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </div>
                        <div className="list-events-in-group">
                          {eventsByDate[dateKey].map((event: any, idx: number) => {
                            const league = leagueMap[event.leagueId];
                            const storeColor = league?.brandColor || `hsl(${(event.leagueId || 0) * 137 % 360}, 70%, 50%)`;
                            return (
                              <ListEventCard
                                key={idx}
                                event={event}
                                league={league}
                                storeColor={storeColor}
                                typeLabel={types[event.type]}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
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

function ListEventCard({ event, league, storeColor, typeLabel }: any) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`list-event-card type-${event.type} ${expanded ? 'expanded' : ''}`}
      style={{ '--store-color': storeColor } as any}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="list-event-card-header">
        <div className="list-event-card-primary">
          <div className="list-event-card-time">{event.startTime ? event.startTime.slice(0, 5) : ''}</div>
          <div className="list-event-card-main-info">
            <div className="list-event-card-store">{event.name}</div>
            <div className="list-event-card-sub">{league?.name || event.leagueName || 'No League'} • {event.game}</div>
          </div>
        </div>
        <div className="list-event-card-indicator">
          <span className="type-badge">{typeLabel || ''}</span>
          <span className="expand-icon">▼</span>
        </div>
      </div>
      <div className="list-event-card-expandable">
        <div className="list-event-card-body">
          <div className="list-event-meta">
            <span className="meta-item"><strong>Format:</strong> {event.type}</span>
            {event.entryFee && <span className="meta-item"><strong>Entry:</strong> {event.entryFee}</span>}
          </div>
          {event.description && <div className="list-event-description">{event.description}</div>}
          {event.prizes && <div className="list-event-prizes"><strong>Prizes:</strong> {event.prizes}</div>}
          <div className="list-event-actions">
            {event.ticketLink && (
              <a
                href={event.ticketLink}
                className="list-event-link"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                Tickets & Info
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
