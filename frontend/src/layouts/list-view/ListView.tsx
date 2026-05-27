import React, { useState } from 'react';
import ListEventGroup from '../../../components/calendar/list-event-group/ListEventGroup';
import type { ListViewProps } from './ListViewProps';
import styles from './ListView.module.css';

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

    if (sortedDates.length === 0) {
        return <div className={styles.listNoEvents}>No events found.</div>;
    }

    const handleToggleEvent = (eventId: number) => {
        setExpandedEventId(prev => (prev === eventId ? null : eventId));
    };

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
