import React from 'react';
import EventCard from '../../event-card/EventCard';
import type { SelectedDaySectionProps } from './SelectedDaySectionProps';

const SelectedDaySection: React.FC<SelectedDaySectionProps> = ({
    selectedDateKey,
    selectedDayEvents,
    leagueMap,
    types
}) => {
    if (!selectedDateKey) return null;

    return (
        <div className="selected-day-section active animate-fade-down">
            <div className="event-list-title">
                {new Date(selectedDateKey + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
            </div>
            <div className="event-list">
                {selectedDayEvents.length === 0 ? (
                    <div className="no-events">No events scheduled for this day.</div>
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
