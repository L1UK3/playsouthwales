import React from 'react';
import type { ListEventGroupProps } from './ListEventGroupProps';
import styles from './ListEventGroup.module.css';
import { ListCard } from '@playwales/shared';

/**
 * ListEventGroup component displays a grouped list of events for a specific date within the ListView.
 * It renders a date header followed by a series of ListEventCards for that day.
 * @param props - The properties passed to the component including the date key, events for that day, league mapping, event types, and expansion state/handlers.
 * @returns JSX.Element
 */
const ListEventGroup: React.FC<ListEventGroupProps> = ({
    dateKey,
    eventsForDay,
    leagueMap,
    types,
    expandedEventId,
    onToggleEvent
}) => {
    const date = new Date(dateKey + 'T00:00:00');
    const dateText = date.toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const isToday = dateKey === new Date().toISOString().split('T')[0];

    return (
        <div className={styles.listEventsGroup} id={`date-${dateKey}`}>
            <div className={`${styles.listGroupDate} ${isToday ? styles.today : ''}`}>{dateText}</div>
            <div className={styles.listEventsInGroup}>
                {eventsForDay.map(event => (
                    <ListCard
                        key={event.id}
                        event={event}
                        leagueMap={leagueMap}
                        types={types}
                        isExpanded={expandedEventId === event.id}
                        onToggle={() => onToggleEvent(event.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ListEventGroup;
