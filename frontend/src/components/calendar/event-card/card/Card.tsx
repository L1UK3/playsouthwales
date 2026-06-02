import React from 'react';
import type { EventCardProps } from '../EventCardProps';
import styles from './Card.module.css';

/**
 * Card component represents a single event entry within a calendar cell.
 * @param {EventCardProps} props - The properties passed to the component including the event, leagueMap, and event types.
 * @returns {JSX.Element} The rendered card component.
 */
const Card: React.FC<EventCardProps> = ({ event, leagueMap, types }) => {
    const storeColor = event.leagueId && leagueMap[event.leagueId]?.brandColor 
                       ? leagueMap[event.leagueId].brandColor 
                       : `hsl(${(event.leagueId || 0) * 137 % 360}, 70%, 50%)`;
    
    return (
        <div 
            className={`${styles.event} type-${event.type}`} 
            style={{ '--store-color': storeColor } as React.CSSProperties}
        >
            <span>{event.leagueName || 'Event'}</span>
            <span className={styles.type}>{types[event.type] || event.type}</span>
        </div>
    );
};

export default Card;
