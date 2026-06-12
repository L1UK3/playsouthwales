import React, { useMemo } from 'react';
import styles from './EventList.module.css';
import ListView from '@calendar/components/list-view/ListView';
import { Calendar } from 'lucide-react';
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
            <div className={styles.noEvents}>
                <Calendar className={styles.noEventsIcon} size={36} />
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
