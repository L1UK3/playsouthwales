import React from 'react';
import type { EventCardProps } from './EventCardProps';

const EventCard: React.FC<EventCardProps> = ({ event, leagueMap, types }) => {
    const league = event.leagueId ? leagueMap[event.leagueId] : null;
    const leagueName = league?.name || event.leagueName || 'Unknown League';
    const storeColor = league?.brandColor || `hsl(${(event.leagueId || 0) * 137 % 360}, 70%, 50%)`;

    return (
        <div className={`event-card type-${event.type}`} style={{ '--store-color': storeColor } as React.CSSProperties}>
            <div className="event-card-content">
                <div className="event-card-header">
                    <div className="event-card-store">{event.name}</div>
                    <div className="event-card-type">
                        {types[event.type] ? `${types[event.type]} ` : ''}{event.type} • {event.game}
                    </div>
                </div>
                <div className="event-card-details">
                    <div className="event-card-league">{leagueName}</div>
                    <div className="event-card-time">
                        {event.startTime || ''} {event.entryFee ? `• ${event.entryFee}` : ''}
                    </div>
                </div>
                {event.description && <div className="event-card-description">{event.description}</div>}
                {event.prizes && (
                    <div className="event-card-prizes">
                        <strong>Prizes:</strong> {event.prizes}
                    </div>
                )}
                {event.ticketLink && (
                    <a href={event.ticketLink} className="event-card-link" target="_blank" rel="noopener noreferrer">
                        Tickets & Info
                    </a>
                )}
            </div>
        </div>
    );
};

export default EventCard;
