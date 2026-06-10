import React from 'react';
import EventCard from '@calendar/components/event-card/default/EventCard';
import styles from '@calendar/components/selected-day-section/SelectedDaySection.module.css';
import type { Event } from '@/types/Event';
import type { League } from '@/types/League';
import type { EventTypes } from '@/types/EventTypes';

/**
 * Properties for the SelectedDaySection component.
 * @property selectedDateKey - The dateKey of the currently selected day (YYYY-MM-DD).
 * @property selectedDayEvents - Array of events occurring on the selected day.
 * @property leagueMap - A mapping of league IDs to league details for branding.
 * @property types - A mapping of event type keys to their display names or icons.
 */
export interface SelectedDaySectionProps {
    selectedDateKey: string | null;
    selectedDayEvents: Event[];
    leagueMap: Record<number, League>;
    types: EventTypes;
}

/**
 * SelectedDaySection component displays a detailed list of events for a specific selected date.
 * It appears when a user clicks on a calendar cell and provides full event information.
 * @param props - The properties passed to the component including the selected date key, events for that day, league mapping, and event types.
 * @returns JSX.Elemnent
 */
const SelectedDaySection: React.FC<SelectedDaySectionProps> = ({
    selectedDateKey,
    selectedDayEvents,
    leagueMap,
    types
}) => {
    if (!selectedDateKey) return null;

    return (
        <div className={`${styles.selectedDaySection} ${styles.active} card-container`}>
            <div className={styles.eventListTitle}>
                {new Date(selectedDateKey + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
            </div>
            <div className={styles.eventList}>
                {selectedDayEvents.length === 0 ? (
                    <div className={styles.noEvents}>No events scheduled for this day.</div>
                ) : (
                    selectedDayEvents.map(event => (
                        <EventCard key={event.id} event={event} leagueMap={leagueMap} types={types} />
                    ))
                )}
            </div>
        </div>
    );
};

export default SelectedDaySection;
