import React from 'react';
import EventCard from '@calendar/components/event-card/default/EventCard';

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
        <div className={"!block animate-[slideInDown_0.4s_ease_forwards] card-container min-[1440px]:landscape:!flex min-[1440px]:landscape:flex-col min-[1440px]:landscape:flex-[0_0_480px] min-[1440px]:landscape:max-w-[480px] min-[1440px]:landscape:animate-[slideInRight_0.4s_ease_forwards] min-[1440px]:landscape:mt-0"}>
            <div className="text-xl font-bold p-5 bg-bg-day-header text-text-main border-3 border-border-color border-b-0 rounded-t-[22px] min-[1440px]:landscape:shrink-0 min-[1440px]:landscape:h-[54px] min-[1440px]:landscape:flex min-[1440px]:landscape:items-center min-[1440px]:landscape:px-5 min-[1440px]:landscape:py-0">
                {new Date(selectedDateKey + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
            </div>
            <div className="grid gap-3.5 p-5 border-3 border-border-color rounded-b-[22px] min-[1440px]:landscape:flex-1 min-[1440px]:landscape:min-h-0 min-[1440px]:landscape:overflow-y-auto">
                {selectedDayEvents.length === 0 ? (
                    <div className="text-text-muted text-sm p-3.5 rounded-xl bg-bg-main text-center">No events scheduled for this day.</div>
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
