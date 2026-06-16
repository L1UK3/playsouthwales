import React from 'react';
import EventCard from '@calendar/components/event-card/EventCard';
import { X } from 'lucide-react';

import type { Event } from '@/types/Event';
import type { League } from '@/types/League';
import type { EventTypes } from '@/types/EventTypes';

/**
 * Properties for the SelectedDaySection component.
 * @property selectedDateKey - The dateKey of the currently selected day (YYYY-MM-DD).
 * @property selectedDayEvents - Array of events occurring on the selected day.
 * @property leagueMap - A mapping of league IDs to league details for branding.
 * @property types - A mapping of event type keys to their display names or icons.
 * @property onClose - Optional callback to clear/close the selection.
 */
export interface SelectedDaySectionProps {
    selectedDateKey: string | null;
    selectedDayEvents: Event[];
    leagueMap: Record<number, League>;
    types: EventTypes;
    onClose?: () => void;
}

/**
 * SelectedDaySection component displays a detailed list of events for a specific selected date.
 * It appears when a user clicks on a calendar cell and provides full event information.
 * @returns JSX.Element
 */
const SelectedDaySection: React.FC<SelectedDaySectionProps> = ({
    selectedDateKey,
    selectedDayEvents,
    leagueMap,
    types,
    onClose
}) => {
    if (!selectedDateKey) return null;

    return (
        <div className="block! animate-swipe-left bg-bg-card rounded-lg shadow-main overflow-hidden min-[1440px]:landscape:flex! min-[1440px]:landscape:flex-col min-[1440px]:landscape:flex-[0_0_420px] min-[1440px]:landscape:max-w-105 min-[1440px]:landscape:animate-slide-in-right min-[1440px]:landscape:mt-0 min-[1440px]:landscape:h-full">
            <div className="text-base font-bold p-3.5 bg-bg-day-header text-text-main border-2 border-border-color border-b-0 rounded-t-lg min-[1440px]:landscape:shrink-0 min-[1440px]:landscape:h-11 min-[1440px]:landscape:flex min-[1440px]:landscape:items-center min-[1440px]:landscape:px-4 min-[1440px]:landscape:py-0 flex items-center justify-between">
                <span>
                    {new Date(selectedDateKey + 'T00:00:00').toLocaleDateString(undefined, {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                </span>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-text-muted hover:text-text-main transition-colors duration-200 focus:outline-none cursor-pointer"
                        aria-label="Close details"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>
            <div className="flex flex-col gap-2.5 p-3.5 border-2 border-border-color rounded-b-lg min-[1440px]:landscape:flex-1 min-[1440px]:landscape:min-h-0 min-[1440px]:landscape:overflow-y-auto">
                {selectedDayEvents.length === 0 ? (
                    <div className="text-text-muted text-sm p-2.5 rounded-xl bg-bg-main text-center">No events scheduled for this day.</div>
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
