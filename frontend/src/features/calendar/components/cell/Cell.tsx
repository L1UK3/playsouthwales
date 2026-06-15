import React from "react";

import Card from "@calendar/components/event-card/card/Card";
import type { Event } from '@/types/Event';
import type { League } from '@/types/League';
import type { EventTypes } from '@/types/EventTypes';

/**
 * @interface CellProps
 * @description Properties for the Cell component.
 * @property {number} day - The day of the month to display.
 * @property {string} dateKey - The unique key representing the date (e.g., YYYY-MM-DD).
 * @property {boolean} isOtherMonth - Whether the cell belongs to a month other than the one currently being viewed.
 * @property {Event[]} eventsForDay - The list of events occurring on this specific day.
 * @property {Record<number, League>} leagueMap - A mapping of league IDs to league details.
 * @property {EventTypes} types - A mapping of event type keys to their display names or icons.
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
    types: EventTypes;
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
const Cell: React.FC<CellProps> = React.memo(({
    day,
    dateKey,
    isOtherMonth,
    eventsForDay,
    leagueMap,
    types,
    selectedDateKey,
    todayKey,
    onSelectDay
}) => {
    const isSelected = dateKey === selectedDateKey;
    const isToday = dateKey === todayKey;

    return (
        <div
            className={`min-h-[120px] min-w-[120px] p-3.5 bg-bg-card cursor-pointer flex flex-col justify-between transition-all duration-200 hover:bg-bg-card-hover hover:-translate-y-px active:translate-y-px max-sm:min-h-[110px] max-sm:p-3 last:rounded-br-[19px] [&:nth-last-child(7)]:rounded-bl-[19px] ${isOtherMonth ? "!bg-bg-cell-empty !cursor-default" : ""} ${isSelected ? "!outline !outline-3 !outline-selected-border !-outline-offset-3" : ""} ${isToday ? "!border-2 !border-today-border" : ""}`}
            onClick={() => !isOtherMonth && onSelectDay(dateKey)}
            data-date-key={dateKey}
        >
            <div className="text-sm font-bold text-text-main mb-2.5 max-sm:text-xs">{day}</div>
            {eventsForDay.length > 0 ? (
                <div className="grid gap-2">
                    {eventsForDay.slice(0, 2).map((event) => (
                        <Card
                            key={event.id}
                            event={event}
                            leagueMap={leagueMap}
                            types={types}
                            isOtherMonth={isOtherMonth}
                        />
                    ))}
                    {eventsForDay.length > 2 ? (
                        <div className="py-2 px-2.5 rounded-[10px] bg-event-more-bg text-event-more-text text-xs text-center">
                            {eventsForDay.length - 2} more event{eventsForDay.length - 2 === 1 ? '' : 's'}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
});

export default Cell;
