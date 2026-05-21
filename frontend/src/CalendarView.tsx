import { CalendarEventCard, DetailedEventCard } from './EventCard';

export function CalendarView({ 
  calendarDays, 
  getLocalDateString, 
  TODAY, 
  selectedDateKey, 
  setSelectedDateKey, 
  eventsByDate, 
  leagueMap, 
  types 
}: any) {
  return (
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
          {calendarDays.map((day: any, idx: number) => {
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
                        <CalendarEventCard 
                          key={eIdx}
                          event={event}
                          league={league}
                          storeColor={storeColor}
                          types={types}
                        />
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
                  <DetailedEventCard 
                    key={idx}
                    event={event}
                    league={league}
                    storeColor={storeColor}
                    types={types}
                  />
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
