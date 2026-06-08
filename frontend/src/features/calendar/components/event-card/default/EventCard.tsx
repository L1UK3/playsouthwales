import React from 'react';
import styles from './EventCard.module.css';
import type { EventCardProps } from '../../../types/EventCard.types';

/**
 * EventCard component displays information about a single event.
 * It supports two variants: 'default' (full details) and 'list' (expandable summary).
 * @param {EventCardProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered event card.
 */
const EventCard: React.FC<EventCardProps> = React.memo(({
    event,
    leagueMap,
    types
}) => {
    const league = event.leagueId ? leagueMap[event.leagueId] : null;
    const leagueName = league?.name ?? event.leagueName ?? 'Unknown League';
    const storeColor = league?.brandColor ?? `hsl(${(event.leagueId ?? 0) * 137 % 360}, 70%, 50%)`;

    return (
        <div className={`${styles.eventCard} gradient-card type-${event.type}`} style={{ '--store-color': storeColor } as React.CSSProperties}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <div className={styles.store}>{event.name}</div>
                    <div className={styles.type}>
                        {types[event.type] ? `${types[event.type]} ` : ''}{event.type} • {event.game}
                    </div>
                </div>

                <div className={styles.details}>
                    <div className={styles.league}>{leagueName}</div>
                    <div className={styles.time}>
                        {event.startTime ?? ''} {event.entryFee ? `• ${event.entryFee}` : ''}
                    </div>
                </div>

                {event.description ? <div className={`${styles.description} description-box`}>{event.description}</div> : null}
                {event.prizes ? (
                    <div className={`${styles.prizes} prizes-box`}>
                        <strong>Prizes:</strong> {event.prizes}
                    </div>
                ) : null}
                {event.ticketLink ? (
                    <a href={event.ticketLink} className={`${styles.link} btn btn-primary`} target="_blank" rel="noopener noreferrer">
                        Tickets & Info
                    </a>
                ) : null}
            </div>
        </div>
    );
});

export default EventCard;
