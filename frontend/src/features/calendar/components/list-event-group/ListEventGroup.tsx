import React, { useMemo } from 'react';
import styles from '@calendar/components/list-event-group/ListEventGroup.module.css';
import ListCard from '@calendar/components/event-card/list/ListCard';
import type { Event } from '@/types/Event';
import type { League } from '@/types/League';
import type { EventTypes } from '@/types/EventTypes';
import { getLocalDateString } from '@calendar/utils/getLocalDateString';

/**
 * Properties for the ListEventGroup component.
 * @property dateKey - A unique string identifier for the date (YYYY-MM-DD).
 * @property eventsForDay - Array of events occurring on this specific day.
 * @property leagueMap - A mapping of league IDs to league details for branding.
 * @property types - A mapping of event type keys to their display names or icons.
 * @property expandedEventId - The ID of the currently expanded event card, or null if none are expanded.
 * @property onToggleEvent - Callback function triggered when an event card is clicked to toggle its expansion.
 */
export interface ListEventGroupProps {
    dateKey: string;
    eventsForDay: Event[];
    leagueMap: Record<number, League>;
    types: EventTypes;
    expandedEventId: number | null;
    onToggleEvent: (eventId: number) => void;
}

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
    const dateText = new Date(dateKey + 'T00:00:00').toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const isToday = useMemo(() => dateKey === getLocalDateString(new Date()), [dateKey]);

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
