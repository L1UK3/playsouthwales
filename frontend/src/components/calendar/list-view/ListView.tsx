import React, { useState } from 'react';
import type { Event, League, EventTypes } from '../../../types';

interface ListViewProps {
    currentDate: Date;
    events: Record<string, Event[]>;
    leagueMap: Record<number, League>;
    types: EventTypes;
}

const ListView: React.FC<ListViewProps> = ({ currentDate, events, leagueMap, types }) => {
    const [expandedEventId, setExpandedEventId] = useState<number | null>(null);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}-${month}-`;

    const sortedDates = Object.keys(events)
        .filter(dateKey => dateKey.startsWith(prefix))
        .sort();

    if (sortedDates.length === 0) {
        return <div className="list-no-events">No events found.</div>;
    }

    return (
        <div id="list-view-events" className="event-list">
            {sortedDates.map(dateKey => {
                const eventsForDay = events[dateKey];
                const date = new Date(dateKey + 'T00:00:00');
                const dateText = date.toLocaleDateString(undefined, {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                });

                return (
                    <div key={dateKey} className="list-events-group">
                        <div className="list-group-date">{dateText}</div>
                        <div className="list-events-in-group">
                            {eventsForDay.map(event => {
                                const isExpanded = expandedEventId === event.id;
                                const league = event.leagueId ? leagueMap[event.leagueId] : null;
                                const leagueName = league?.name || event.leagueName || 'Unknown League';
                                const storeColor = league?.brandColor || `hsl(${(event.leagueId || 0) * 137 % 360}, 70%, 50%)`;

                                return (
                                    <div 
                                        key={event.id} 
                                        className={`list-event-card type-${event.type} ${isExpanded ? 'expanded' : ''}`}
                                        style={{ '--store-color': storeColor } as React.CSSProperties}
                                        onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                                    >
                                        <div className="list-event-card-header">
                                            <div className="list-event-card-primary">
                                                <div className="list-event-card-time">{event.startTime?.slice(0, 5) || ''}</div>
                                                <div className="list-event-card-main-info">
                                                    <div className="list-event-card-store">{event.name}</div>
                                                    <div className="list-event-card-sub">{leagueName} • {event.game}</div>
                                                </div>
                                            </div>
                                            <div className="list-event-card-indicator">
                                                <span className="type-badge">{types[event.type] || ''}</span>
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
                                                            rel="noopener noreferrer"
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
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ListView;
