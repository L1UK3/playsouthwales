import React from 'react';

import type { Event } from '@/types/Event';
import type { League } from '@/types/League';
import type { EventTypeMap } from '@/types/EventTypeMap';
import { CalendarCard } from '@/features/event-card';
import { useSortEvents } from '@/hooks/useSortEvents';

/**
 * @interface CellProps
 * @description Properties for the Cell component.
 * @property {number} day - The day of the month to display.
 * @property {string} dateKey - The unique key representing the date (e.g., YYYY-MM-DD).
 * @property {boolean} isOtherMonth - Whether the cell belongs to a month other than the one currently being viewed.
 * @property {Event[]} eventsForDay - The list of events occurring on this specific day.
 * @property {Record<number, League>} leagueMap - A mapping of league IDs to league details.
 * @property {EventTypeMap} types - A mapping of event type keys to their display names or icons.
 * @property {string | null} selectedDateKey - The key of the currently selected date.
 * @property {string} todayKey - The key representing today's date.
 * @property {(dateKey: string) => void} onSelectDay - Callback function triggered when a cell is clicked.
 */

export interface CellProps {
    day: number;
    dateKey: string;
    isOtherMonth: boolean;
    eventsForDay: Event[];
    leagueMap: Record<number, League>;
    types: EventTypeMap;
    selectedDateKey: string | null;
    todayKey: string;
    onSelectDay: (dateKey: string) => void;
}

/**
 * Cell component represents an individual day in the calendar grid.
 * It displays the day number and a summary of events for that specific date.
 * @param {CellProps} props - The properties passed to the component including day, events, and selection state.
 * @returns {JSX.Element} The rendered calendar cell.
 */
const Cell: React.FC<CellProps> = React.memo(
    ({
        day,
        dateKey,
        isOtherMonth,
        eventsForDay,
        leagueMap,
        types,
        selectedDateKey,
        todayKey,
        onSelectDay,
    }) => {
        const isSelected = dateKey === selectedDateKey;
        const isToday = dateKey === todayKey;

        const sortedEvents = useSortEvents(eventsForDay);

        return (
            <div
                className={`min-h-12 @min-[700px]:min-h-36 @min-[700px]:h-full min-w-0 w-full p-1.5 @min-[700px]:p-2 bg-bg-card cursor-pointer flex flex-col justify-between transition-[background-color,border-color,outline,transform] duration-150 ease-out hover:bg-bg-card-hover hover:-translate-y-px active:translate-y-px last:rounded-br-[7px] nth-last-7:rounded-bl-[7px] ${isOtherMonth ? 'bg-bg-cell-empty! cursor-default!' : ''} ${isSelected ? 'outline! outline-selected-border! -outline-offset-3!' : ''} ${isToday ? 'border-2! border-today-border!' : ''}`}
                onClick={() => !isOtherMonth && onSelectDay(dateKey)}
                data-date-key={dateKey}
            >
                <div className="text-xs font-bold text-text-main mb-1 @min-[700px]:mb-1.5">
                    {day}
                </div>
                {eventsForDay.length > 0 ? (
                    <>
                        {/* Mobile view: show compact CalendarCard */}
                        <div className="grid @min-[700px]:hidden gap-1 min-w-0">
                            {sortedEvents.slice(0, 1).map((event) => (
                                <CalendarCard
                                    key={event.id}
                                    event={event}
                                    leagueMap={leagueMap}
                                    types={types}
                                    isOtherMonth={isOtherMonth}
                                />
                            ))}
                            {sortedEvents.length > 1 ? (
                                <div className="py-0.5 px-1 rounded bg-event-more-bg text-event-more-text text-[9px] text-center font-semibold">
                                    +{sortedEvents.length - 1} more
                                </div>
                            ) : null}
                        </div>

                        {/* Desktop/Tablet view: show full card list */}
                        <div className="hidden @min-[700px]:grid gap-1 min-w-0">
                            {sortedEvents.slice(0, 3).map((event) => (
                                <CalendarCard
                                    key={event.id}
                                    event={event}
                                    leagueMap={leagueMap}
                                    types={types}
                                    isOtherMonth={isOtherMonth}
                                />
                            ))}
                            {sortedEvents.length > 3 ? (
                                <div className="py-1 px-1.5 rounded-md bg-event-more-bg text-event-more-text text-[11px] text-center">
                                    {sortedEvents.length - 3} more
                                </div>
                            ) : null}
                        </div>
                    </>
                ) : null}
            </div>
        );
    }
);

export default Cell;
