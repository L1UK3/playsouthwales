import React, { useState, useCallback } from 'react';
import styles from './EventsPanel.module.css';
import NavBar from '@calendar/components/nav-bar/NavBar';
import { MONTH_NAMES } from '@constants';
import type { Event } from '@/types/Event';
import type { League } from '@/types/League';
import type { EventTypes } from '@/types/EventTypes';
import { EventList } from '../EventList/EventList';
import { EventFormModal } from '../EventFormModal/EventFormModal';
import { useAdminEvents } from '../../hooks/useAdminEvents';

export interface EventsPanelProps {
    activeLeague: League;
    leagueMap: Record<number, League>;
    eventTypes: EventTypes;
}

export const EventsPanel: React.FC<EventsPanelProps> = ({
    activeLeague,
    leagueMap,
    eventTypes,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [currentDate, setCurrentDate] = useState(() => new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const {
        events,
        isEventsLoading,
        createEvent,
        updateEvent,
        deleteEvent,
        isSaving,
    } = useAdminEvents(activeLeague.leagueId, month, year);

    const handlePrevMonth = useCallback(() => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }, []);

    const handleNextMonth = useCallback(() => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }, []);

    const handleGoToToday = useCallback(() => {
        setCurrentDate(new Date());
    }, []);

    const handleAddEventTrigger = useCallback(() => {
        setEditingEvent(null);
        setIsModalOpen(true);
    }, []);

    const handleEditEventTrigger = useCallback((event: Event) => {
        setEditingEvent(event);
        setIsModalOpen(true);
    }, []);

    const handleDeleteEventTrigger = useCallback(async (event: Event) => {
        if (window.confirm(`Are you sure you want to delete the event "${event.name}"? This action cannot be undone.`)) {
            try {
                await deleteEvent(event.id);
            } catch (err) {
                console.error(err);
            }
        }
    }, [deleteEvent]);

    const handleFormSave = useCallback(async (eventData: Omit<Event, 'id' | 'leagueId'>) => {
        const fullEventData = {
            ...eventData,
            leagueId: activeLeague.leagueId,
        };
        if (editingEvent) {
            await updateEvent({ id: editingEvent.id, data: fullEventData });
        } else {
            await createEvent(fullEventData);
        }
    }, [editingEvent, activeLeague.leagueId, createEvent, updateEvent]);

    return (
        <div className={styles.eventsPanel}>
            <div className={styles.panelHeader}>
                <h3>Scheduled Events ({activeLeague.name})</h3>
                <button type="button" className="btn btn-primary" onClick={handleAddEventTrigger}>
                    Schedule New Event
                </button>
            </div>

            <NavBar
                monthName={MONTH_NAMES[currentDate.getMonth()]}
                year={currentDate.getFullYear()}
                onGoToToday={handleGoToToday}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
            />

            <div>
                <EventList
                    events={events}
                    leagueMap={leagueMap}
                    eventTypes={eventTypes}
                    onEdit={handleEditEventTrigger}
                    onDelete={handleDeleteEventTrigger}
                    isLoading={isEventsLoading}
                />
            </div>

            <EventFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingEvent={editingEvent}
                onSave={handleFormSave}
                isSaving={isSaving}
            />
        </div>
    );
};

export default EventsPanel;
