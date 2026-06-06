import React, { useState, useEffect } from 'react';
import styles from './ListView.module.css';
import ListEventGroup from '../list-event-group/ListEventGroup';
import type { Event } from '@/types/Event'
import type { League } from '@/types/League';
import type { EventTypes } from '@/types/EventTypes';

/**
 * Properties for the ListView component.
 * @property currentDate - The currently viewed month and year.
 * @property events - A mapping of date keys (YYYY-MM-DD) to arrays of events for those dates.
 * @property leagueMap - A mapping of league IDs to league details for branding.
 * @property types - A mapping of event type keys to their display names or icons.
 */
export interface ListViewProps {
    currentDate: Date;
    events: Record<string, Event[]>;
    leagueMap: Record<number, League>;
    types: EventTypes;
}


/**
 * ListView component displays a chronological list of events for the currently viewed month.
 * It groups events by date and provides expandable details for each event.
 * @param props - The properties passed to the component including the current date, events mapping, league mapping, and event types.
 * @returns JSX.Element
 */
const ListView: React.FC<ListViewProps> = ({ currentDate, events, leagueMap, types }) => {
    const [expandedEventId, setExpandedEventId] = useState<number | null>(null);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}-${month}-`;

    const sortedDates = Object.keys(events)
        .filter(dateKey => dateKey.startsWith(prefix))
        .sort();

    const handleToggleEvent = (eventId: number) => {
        setExpandedEventId(prev => (prev === eventId ? null : eventId));
    };

    useEffect(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const timeoutId = setTimeout(() => {
            const todayElement = document.getElementById(`date-${todayStr}`);
            if (todayElement) {
                todayElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [sortedDates]);

    if (sortedDates.length === 0) {
        return <div className={styles.listNoEvents}>No events found.</div>;
    }

    return (
        <div id="list-view-events" className={styles.listViewEvents}>
            {sortedDates.map(dateKey => (
                <ListEventGroup
                    key={dateKey}
                    dateKey={dateKey}
                    eventsForDay={events[dateKey]}
                    leagueMap={leagueMap}
                    types={types}
                    expandedEventId={expandedEventId}
                    onToggleEvent={handleToggleEvent}
                />
            ))}
        </div>
    );
};

export default ListView;
