import React from 'react';
import type { EventCardProps } from '../EventCard.types';
import styles from './Card.module.css';

/**
 * Additional props for the Card component.
 * @property {boolean} [isOtherMonth] - Indicates if the card is for a day in another month, which may affect its styling.
 */
export interface CardProps {
    isOtherMonth?: boolean;
}

/**
 * Card component represents a single event entry within a calendar cell.
 * @param {EventCardProps} props - The properties passed to the component including the event, leagueMap, and event types.
 * @returns {JSX.Element} The rendered card component.
 */
const Card: React.FC<EventCardProps & CardProps> = React.memo(({ event, leagueMap, types, isOtherMonth }) => {
    const storeColor = event.leagueId && leagueMap[event.leagueId]?.brandColor
        ? leagueMap[event.leagueId].brandColor
        : `hsl(${(event.leagueId ?? 0) * 137 % 360}, 70%, 50%)`;

    return (
        <div
            className={`${styles.event} type-${event.type} ${isOtherMonth ? styles.otherMonth : ''}`}
            style={{ '--store-color': storeColor } as React.CSSProperties}
        >
            <span>{event.leagueName ?? 'Event'}</span>
            <span className={styles.type}>{types[event.type] ?? event.type}</span>
        </div>
    );
});

export default Card;
