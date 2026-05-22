import React from 'react';
import type { Event, League, EventTypes } from '../../../types';

interface ListEventCardProps {
    event: Event;
    leagueMap: Record<number, League>;
    types: EventTypes;
    isExpanded: boolean;
    onToggle: () => void;
}

const ListEventCard: React.FC<ListEventCardProps> = ({ event, leagueMap, types, isExpanded, onToggle }) => {
    const league = event.leagueId ? leagueMap[event.leagueId] : null;
    const leagueName = league?.name || event.leagueName || 'Unknown League';
    const storeColor = league?.brandColor || `hsl(${(event.leagueId || 0) * 137 % 360}, 70%, 50%)`;

    return (
        <div 
            className={`list-event-card type-${event.type} ${isExpanded ? 'expanded' : ''}`}
            style={{ '--store-color': storeColor } as React.CSSProperties}
            onClick={onToggle}
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
};

export default ListEventCard;
