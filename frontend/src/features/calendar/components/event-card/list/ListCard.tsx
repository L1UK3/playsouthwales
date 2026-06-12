import React from 'react';
import styles from '@calendar/components/event-card/list/ListCard.module.css';
import type { EventCardProps } from '@calendar/types/EventCard.types';
import type { Event } from '@/types/Event';

/**
 * @interface ListCardProps
 * @description Additional props for the ListCard component.
 * @property {boolean} [isExpanded] - Whether the card is expanded (used in 'list' variant).
 * @property {() => void} [onToggle] - Callback triggered when toggling the card expansion.
 */

export interface ListCardProps {
    isExpanded?: boolean;
    onToggle?: () => void;
    onEdit?: (event: Event) => void;
    onDelete?: (event: Event) => void;
}

/**
 * ListCard component represents a single event entry within a list view.
 * @param {EventCardProps & ListCardProps} props - The properties passed to the ListCard component, including event details, league mapping, event types, and expansion state/handlers.
 * @returns {JSX.Element} The rendered list card component.
 */
const ListCard: React.FC<EventCardProps & ListCardProps> = React.memo(({
    event,
    leagueMap,
    types,
    isExpanded,
    onToggle,
    onEdit,
    onDelete
}) => {
    const league = event.leagueId ? leagueMap[event.leagueId] : null;
    const leagueName = league?.name ?? event.leagueName ?? 'Unknown League';
    const storeColor = league?.brandColor ?? `hsl(${(event.leagueId ?? 0) * 137 % 360}, 70%, 50%)`;

    return (
        <div
            className={`${styles.listEventCard} gradient-card type-${event.type} ${isExpanded ? styles.expanded : ''}`}
            style={{ '--store-color': storeColor } as React.CSSProperties}
            onClick={onToggle}
        >
            <div className={styles.listHeader}>
                <div className={styles.primary}>
                    <div className={styles.listTime}>{event.startTime?.slice(0, 5) ?? ''}</div>
                    <div className={styles.mainInfo}>
                        <div className={styles.listStore}>{event.name}</div>
                        <div className={styles.sub}>{leagueName} • {event.game}</div>
                    </div>
                </div>
                <div className={styles.indicator}>
                    <span className={styles.typeBadge}>{types[event.type] ?? ''}</span>
                    <span className={styles.expandIcon}>▼</span>
                </div>
            </div>
            <div className={styles.expandable}>
                <div className={styles.body}>
                    <div className={styles.meta}>
                        <span className={styles.metaItem}><strong>Format:</strong> {event.type}</span>
                        {event.entryFee ? <span className={styles.metaItem}><strong>Entry:</strong> {event.entryFee}</span> : null}
                    </div>
                    {event.description ? <div className={`${styles.description} description-box`}>{event.description}</div> : null}
                    {event.prizes ? <div className={`${styles.prizes} prizes-box`}><strong>Prizes:</strong> {event.prizes}</div> : null}
                    <div className={styles.actions}>
                        {event.ticketLink ? (
                            <a
                                href={event.ticketLink}
                                className={`${styles.link} btn btn-primary`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Tickets & Info
                            </a>
                        ) : null}
                        {onEdit ? (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ marginLeft: '8px' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(event);
                                }}
                            >
                                Edit
                            </button>
                        ) : null}
                        {onDelete ? (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                style={{
                                    marginLeft: '8px',
                                    borderColor: '#ef4444',
                                    color: '#ef4444',
                                    background: 'rgba(239, 68, 68, 0.05)'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(event);
                                }}
                            >
                                Delete
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ListCard;
