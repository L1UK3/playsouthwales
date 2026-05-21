import { ListEventCard } from './EventCard';

export function ListView({ eventsByDate, leagueMap, types }: any) {
  return (
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
  );
}
