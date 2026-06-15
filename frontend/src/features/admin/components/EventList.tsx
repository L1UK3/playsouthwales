import React, { useMemo } from 'react';

import ListView from '@calendar/components/ListView';
import type { Event } from '@/types/Event';
import type { League } from '@/types/League';
import type { EventTypes } from '@/types/EventTypes';

export interface EventListProps {
    events: Event[];
    leagueMap: Record<number, League>;
    eventTypes: EventTypes;
    onEdit: (event: Event) => void;
    onDelete: (event: Event) => void;
    isLoading: boolean;
}

/**
 * EventList displays a list of events grouped by date using the shared calendar ListView.
 */
export const EventList: React.FC<EventListProps> = ({
    events,
    leagueMap,
    eventTypes,
    onEdit,
    onDelete,
    isLoading,
}) => {
    const groupedEvents = useMemo(() => {
        return events.reduce((acc, event) => {
            const dateKey = event.date.slice(0, 10);
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(event);
            return acc;
        }, {} as Record<string, Event[]>);
    }, [events]);

    if (isLoading) {
        return <div className="loading">Loading events list...</div>;
    }

    if (events.length === 0) {
        return (
            <div className="text-center py-12 px-5 text-text-muted [&_h4]:text-lg [&_h4]:font-bold [&_h4]:mb-2 [&_p]:text-[15px]">
                <h4>No Events Scheduled</h4>
                <p>There are no events matching your filters. Click "Add New Event" to create one.</p>
            </div>
        );
    }

    return (
        <ListView
            events={groupedEvents}
            leagueMap={leagueMap}
            types={eventTypes}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    );
};

export default EventList;
