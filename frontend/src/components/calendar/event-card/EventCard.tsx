import React from 'react';
import styles from './EventCard.module.css';
import type { EventCardProps } from './EventCardProps';

/**
 * EventCard component displays information about a single event.
 * It supports two variants: 'default' (full details) and 'list' (expandable summary).
 * @param {EventCardProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered event card.
 */
const EventCard: React.FC<EventCardProps> = ({ 
    event, 
    leagueMap, 
    types, 
    variant = 'default',
    isExpanded = false,
    onToggle
}) => {
    const league = event.leagueId ? leagueMap[event.leagueId] : null;
    const leagueName = league?.name || event.leagueName || 'Unknown League';
    const storeColor = league?.brandColor || `hsl(${(event.leagueId || 0) * 137 % 360}, 70%, 50%)`;

    // list variant
    if (variant === 'list') {
        return (
            <div 
                className={`${styles.listEventCard} gradient-card type-${event.type} ${isExpanded ? styles.expanded : ''}`}
                style={{ '--store-color': storeColor } as React.CSSProperties}
                onClick={onToggle}
            >
                <div className={styles.listHeader}>
                    <div className={styles.primary}>
                        <div className={styles.listTime}>{event.startTime?.slice(0, 5) || ''}</div>
                        <div className={styles.mainInfo}>
                            <div className={styles.listStore}>{event.name}</div>
                            <div className={styles.sub}>{leagueName} • {event.game}</div>
                        </div>
                    </div>
                    <div className={styles.indicator}>
                        <span className={styles.typeBadge}>{types[event.type] || ''}</span>
                        <span className={styles.expandIcon}>▼</span>
                    </div>
                </div>
                <div className={styles.expandable}>
                    <div className={styles.body}>
                        <div className={styles.meta}>
                            <span className={styles.metaItem}><strong>Format:</strong> {event.type}</span>
                            {event.entryFee && <span className={styles.metaItem}><strong>Entry:</strong> {event.entryFee}</span>}
                        </div>
                        {event.description && <div className={`${styles.description} description-box`}>{event.description}</div>}
                        {event.prizes && <div className={`${styles.prizes} prizes-box`}><strong>Prizes:</strong> {event.prizes}</div>}
                        <div className={styles.actions}>
                            {event.ticketLink && (
                                <a 
                                    href={event.ticketLink} 
                                    className={`${styles.link} btn btn-primary`} 
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
    }

    // Default variant
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
                        {event.startTime || ''} {event.entryFee ? `• ${event.entryFee}` : ''}
                    </div>
                </div>

                {event.description && <div className={`${styles.description} description-box`}>{event.description}</div>}
                {event.prizes && (
                    <div className={`${styles.prizes} prizes-box`}>
                        <strong>Prizes:</strong> {event.prizes}
                    </div>
                )}
                {event.ticketLink && (
                    <a href={event.ticketLink} className={`${styles.link} btn btn-primary`} target="_blank" rel="noopener noreferrer">
                        Tickets & Info
                    </a>
                )}
            </div>
        </div>
    );
};

export default EventCard;
