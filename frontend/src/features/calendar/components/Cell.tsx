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
    isReleaseDay: boolean;
    isLegalityDay: boolean;
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
        isReleaseDay,
        isLegalityDay,
        onSelectDay,
    }) => {
        const isSelected = dateKey === selectedDateKey;
        const isToday = dateKey === todayKey;

        const sortedEvents = useSortEvents(eventsForDay);

        return (
            <div
                className={`min-h-14.5 @min-[700px]:min-h-36 @min-[700px]:h-full min-w-0 w-full px-0.5 py-1 @min-[700px]:p-2 bg-bg-card cursor-pointer flex flex-col justify-between transition-[background-color,border-color,outline,transform] duration-150 ease-out hover:bg-bg-card-hover hover:-translate-y-px active:translate-y-px last:rounded-br-[7px] nth-last-7:rounded-bl-[7px]
                ${isOtherMonth ? 'bg-bg-cell-empty! cursor-default!' : ''}
                ${isSelected ? 'outline! outline-selected-border! -outline-offset-3!' : ''}
                ${isToday ? 'border-2! border-today-border!' : ''}
                ${isReleaseDay ? 'border-2! outline-release-day!' : ''}
                ${isLegalityDay ? 'border-2! outline-legality-day!' : ''}`}
                onClick={() => !isOtherMonth && onSelectDay(dateKey)}
                data-date-key={dateKey}
            >
                <div className="text-[10px] @min-[700px]:text-xs font-bold text-text-main mb-0.5 @min-[700px]:mb-1.5 leading-none px-0.5">
                    {day}
                </div>
                {eventsForDay.length > 0 ? (
                    <div className="grid gap-0.5 @min-[700px]:gap-1 min-w-0 w-full">
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
                            <div className="py-0.5 px-1 @min-[700px]:py-1 @min-[700px]:px-1.5 rounded-xs @min-[700px]:rounded-md bg-event-more-bg text-event-more-text text-[8px] @min-[700px]:text-[11px] text-center font-bold leading-none">
                                +{sortedEvents.length - 3} more
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
        );
    }
);

export default Cell;
