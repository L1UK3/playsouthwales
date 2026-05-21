import { useState } from 'react';

export function CalendarEventCard({ event, league, storeColor, types }: any) {
  return (
    <div
      className={`event type-${event.type}`}
      style={{ '--store-color': storeColor } as any}
    >
      <span>{event.leagueName || 'Event'}</span>
      <span className="type">{types[event.type] || event.type}</span>
    </div>
  );
}

export function ListEventCard({ event, league, storeColor, typeLabel }: any) {
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

export function DetailedEventCard({ event, league, storeColor, types }: any) {
    return (
      <div
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
}
