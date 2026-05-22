import React from 'react';
import type { Event, League, EventTypes } from '../../../types';

interface CardProps {
    event: Event;
    leagueMap: Record<number, League>;
    types: EventTypes;
}

const Card: React.FC<CardProps> = ({ event, leagueMap, types }) => {
    const storeColor = event.leagueId && leagueMap[event.leagueId]?.brandColor 
                       ? leagueMap[event.leagueId].brandColor 
                       : `hsl(${(event.leagueId || 0) * 137 % 360}, 70%, 50%)`;
    
    return (
        <div 
            className={`event type-${event.type}`} 
            style={{ '--store-color': storeColor } as React.CSSProperties}
        >
            <span>{event.leagueName || 'Event'}</span>
            <span className="type">{types[event.type] || event.type}</span>
        </div>
    );
};

export default Card;
