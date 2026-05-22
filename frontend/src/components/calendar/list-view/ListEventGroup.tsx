import React from 'react';
import type { Event, League, EventTypes } from '../../../types';
import ListEventCard from './ListEventCard';

interface ListEventGroupProps {
    dateKey: string;
    eventsForDay: Event[];
    leagueMap: Record<number, League>;
    types: EventTypes;
    expandedEventId: number | null;
    onToggleEvent: (eventId: number) => void;
}

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

    return (
        <div className="list-events-group">
            <div className="list-group-date">{dateText}</div>
            <div className="list-events-in-group">
                {eventsForDay.map(event => (
                    <ListEventCard 
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
