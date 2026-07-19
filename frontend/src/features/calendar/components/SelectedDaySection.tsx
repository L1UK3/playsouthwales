import React from 'react';
import { Calendar } from 'lucide-react';
import type { Event } from '@/types/Event';
import type { League } from '@/types/League';
import type { EventTypeMap } from '@/types/EventTypeMap';
import Footer from '@/layouts/Footer';
import { useSortEvents } from '@/hooks/useSortEvents';
import { EventCard } from '@/features/event-card';

/**
 * Properties for the SelectedDaySection component.
 * @property selectedDateKey - The dateKey of the currently selected day (YYYY-MM-DD).
 * @property selectedDayEvents - Array of events occurring on the selected day or month.
 * @property currentDate - The currently active calendar Date.
 * @property leagueMap - A mapping of league IDs to league details for branding.
 * @property types - A mapping of event type keys to their display names or icons.
 * @property onClose - Optional callback to clear/close the selection.
 */
export interface SelectedDaySectionProps {
    selectedDateKey: string | null;
    selectedDayEvents: Event[];
    currentDate?: Date;
    leagueMap: Record<number, League>;
    types: EventTypeMap;
}

/**
 * SelectedDaySection component displays a detailed list of events for a specific selected date or month.
 * @returns JSX.Element
 */
const SelectedDaySection: React.FC<SelectedDaySectionProps> = ({
    selectedDateKey,
    selectedDayEvents,
    leagueMap,
    types,
}) => {
    const isDateSelected = selectedDateKey !== null;

    const title = isDateSelected
        ? new Date(selectedDateKey + 'T00:00:00').toLocaleDateString(
              undefined,
              {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
              }
          )
        : 'Selected Day';

    const sortedEvents = useSortEvents(selectedDayEvents);

    return (
        <div
            id="selected-day-section"
            key={selectedDateKey ?? 'empty'}
            className="block! animate-swipe-up overflow-hidden @6xl:absolute @6xl:inset-0 @6xl:flex! @6xl:flex-col"
        >
            <div className="text-base font-bold p-3.5 bg-bg-day-header text-text-main @6xl:shrink-0 @6xl:h-11 @6xl:flex @6xl:items-center @6xl:px-4 @6xl:py-0 flex items-center justify-between border-b border-border-color">
                <span>{title}</span>
            </div>
            <div
                className="flex flex-col gap-2.5 p-3.5 @6xl:flex-1 @6xl:min-h-0 @6xl:overflow-y-auto
                            [&::-webkit-scrollbar]:w-1.5
                            [&::-webkit-scrollbar-track]:bg-transparent
                            [&::-webkit-scrollbar-thumb]:bg-border-color/70
                            [&::-webkit-scrollbar-thumb]:rounded-[10px]
                            [&::-webkit-scrollbar-thumb:hover]:bg-text-muted"
            >
                {!isDateSelected ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-text-muted gap-2">
                        <Calendar className="size-12 text-border-color stroke-[1.5]" />
                        <p className="font-bold text-sm">No Date Selected</p>
                        <p className="text-xs">
                            Click a date on the calendar to view its scheduled
                            events.
                        </p>
                    </div>
                ) : sortedEvents.length === 0 ? (
                    <div className="text-text-muted text-sm p-2.5 rounded-xl bg-bg-main text-center">
                        No events scheduled.
                    </div>
                ) : (
                    <div className="flex flex-col gap-2.5">
                        {sortedEvents.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                leagueMap={leagueMap}
                                types={types}
                            />
                        ))}
                        <Footer />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SelectedDaySection;
