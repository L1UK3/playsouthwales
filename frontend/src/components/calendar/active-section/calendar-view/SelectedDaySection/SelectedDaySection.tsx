import React from 'react';
import { EventCard } from '@event-card';
import type { SelectedDaySectionProps } from './SelectedDaySectionProps';
import styles from './SelectedDaySection.module.css';

const SelectedDaySection: React.FC<SelectedDaySectionProps> = ({
    selectedDateKey,
    selectedDayEvents,
    leagueMap,
    types
}) => {
    if (!selectedDateKey) return null;

    return (
        <div className={`${styles.selectedDaySection} ${styles.active} animate-fade-down`}>
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
