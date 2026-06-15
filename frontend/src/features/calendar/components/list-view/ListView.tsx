import React, { useState, useMemo, useCallback } from 'react';

import ListEventGroup from '@calendar/components/list-event-group/ListEventGroup';
import type { Event } from '@/types/Event'
import type { League } from '@/types/League';
import type { EventTypes } from '@/types/EventTypes';

/**
 * Properties for the ListView component.
 * @property currentDate - The currently viewed month and year (optional).
 * @property events - A mapping of date keys (YYYY-MM-DD) to arrays of events for those dates.
 * @property leagueMap - A mapping of league IDs to league details for branding.
 * @property types - A mapping of event type keys to their display names or icons.
 */
export interface ListViewProps {
    currentDate?: Date;
    events: Record<string, Event[]>;
    leagueMap: Record<number, League>;
    types: EventTypes;
    onEdit?: (event: Event) => void;
    onDelete?: (event: Event) => void;
}


/**
 * ListView component displays a chronological list of events for the currently viewed month.
 * It groups events by date and provides expandable details for each event.
 * @param props - The properties passed to the component including the current date, events mapping, league mapping, and event types.
 * @returns JSX.Element
 */
const ListView: React.FC<ListViewProps> = ({ currentDate, events, leagueMap, types, onEdit, onDelete }) => {
    const [expandedEventId, setExpandedEventId] = useState<number | null>(null);

    const sortedDates = useMemo(() => {
        const dateKeys = Object.keys(events);
        if (currentDate) {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const prefix = `${year}-${month}-`;
            return dateKeys.filter(dateKey => dateKey.startsWith(prefix)).sort();
        }
        return dateKeys.sort();
    }, [events, currentDate]);

    const handleToggleEvent = useCallback((eventId: number) => {
        setExpandedEventId(prev => (prev === eventId ? null : eventId));
    }, []);

    if (sortedDates.length === 0) {
        return <div className="py-10 px-5 text-center text-text-muted text-base">No events found.</div>;
    }

    return (
        <div id="list-view-events" className="flex flex-col gap-3">
            {sortedDates.map(dateKey => (
                <ListEventGroup
                    key={dateKey}
                    dateKey={dateKey}
                    eventsForDay={events[dateKey]}
                    leagueMap={leagueMap}
                    types={types}
                    expandedEventId={expandedEventId}
                    onToggleEvent={handleToggleEvent}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};

export default ListView;
