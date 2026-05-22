import React, { useState } from 'react';
import type { Event, League, EventTypes } from '../../../types';
import ListEventGroup from './ListEventGroup';

interface ListViewProps {
    currentDate: Date;
    events: Record<string, Event[]>;
    leagueMap: Record<number, League>;
    types: EventTypes;
}

const ListView: React.FC<ListViewProps> = ({ currentDate, events, leagueMap, types }) => {
    const [expandedEventId, setExpandedEventId] = useState<number | null>(null);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}-${month}-`;

    const sortedDates = Object.keys(events)
        .filter(dateKey => dateKey.startsWith(prefix))
        .sort();

    if (sortedDates.length === 0) {
        return <div className="list-no-events">No events found.</div>;
    }

    const handleToggleEvent = (eventId: number) => {
        setExpandedEventId(prev => (prev === eventId ? null : eventId));
    };

    return (
        <div id="list-view-events" className="event-list">
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
