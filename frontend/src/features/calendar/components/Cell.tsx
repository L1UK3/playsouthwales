import React from 'react';

import type { Event } from '@/types/Event';
import type { League } from '@/types/League';
import type { EventTypeMap } from '@/types/EventTypeMap';
import { CalendarCard } from '@/features/event-card';
import { useSortEvents } from '@/hooks/useSortEvents';

export interface CellProps {
    day: number;
    dateKey: string;
    isOtherMonth: boolean;
    eventsForDay: Event[];
    leagueMap: Record<number, League>;
    types: EventTypeMap;
    selectedDateKey: string | null;
    todayKey: string;
    isSpecialDay: boolean;
    onSelectDay: (dateKey: string) => void;
}

const CHAMPIONSHIP_TYPES = new Set([
    'CUP',
    'SPECIAL',
    'REGIONAL',
    'INTERNATIONAL',
    'WORLDS',
]);

const THEME_STYLES = {
    gold: 'border border-gold-border bg-linear-to-br from-gold-500/[0.5] to-transparent shadow-md shadow-gold-400/5 text-white',
    silver: 'border border-silver-border bg-linear-to-br from-slate-500/[0.5] to-transparent shadow-md shadow-slate-400/5 text-white',
    purple: 'border border-purple-border bg-linear-to-br from-purple-600/[0.5] to-transparent shadow-md shadow-purple-500/5 text-white',
} as const;

function getCellStyles(events: Event[]): string {
    if (!events.length) return '';
    let hasChallenge = false;
    let hasPrerelease = false;
    for (const event of events) {
        if (CHAMPIONSHIP_TYPES.has(event.eventType)) return THEME_STYLES.gold;
        if (event.eventType === 'PRE-RELEASE') hasPrerelease = true;
        else if (event.eventType === 'CHALLENGE') hasChallenge = true;
    }
    if (hasPrerelease) return THEME_STYLES.purple;
    if (hasChallenge) return THEME_STYLES.silver;
    return '';
}

/**
 * Cell component represents an individual day in the calendar grid.
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
        isSpecialDay,
        onSelectDay,
    }) => {
        const isSelected = dateKey === selectedDateKey;
        const isToday = dateKey === todayKey;

        const sortedEvents = useSortEvents(eventsForDay);
        const backgroundStyle = isOtherMonth ? '' : getCellStyles(sortedEvents);
        const visibleEvents = sortedEvents.slice(0, 3);
        const extraCount = sortedEvents.length - 3;

        return (
            <div
                className={`min-h-14.5 @min-[700px]:min-h-36 @min-[700px]:h-full min-w-0 w-full px-0.5 py-1 @min-[700px]:p-2 bg-bg-card cursor-pointer flex flex-col justify-between transition-[background-color,border-color,outline,transform,box-shadow] duration-150 ease-out hover:bg-bg-card-hover hover:-translate-y-px active:translate-y-px last:rounded-br-[7px] nth-last-7:rounded-bl-[7px]
                ${isOtherMonth ? 'bg-bg-cell-empty! cursor-default!' : ''}
                ${isSelected ? 'outline! outline-selected-border! -outline-offset-3!' : ''}
                ${isToday ? 'border-2! border-today-border!' : ''}
                ${isSpecialDay ? 'border-2! border-special-day-border!' : ''}
                ${backgroundStyle}`}
                onClick={() => !isOtherMonth && onSelectDay(dateKey)}
                data-date-key={dateKey}
            >
                <div className="text-[10px] @min-[700px]:text-xs font-bold text-text-main mb-0.5 @min-[700px]:mb-1.5 leading-none px-0.5">
                    {day}
                </div>
                {sortedEvents.length > 0 && (
                    <div className="grid gap-0.5 @min-[700px]:gap-1 min-w-0 w-full">
                        {visibleEvents.map((event) => (
                            <CalendarCard
                                key={event.id}
                                event={event}
                                leagueMap={leagueMap}
                                types={types}
                                isOtherMonth={isOtherMonth}
                            />
                        ))}
                        {extraCount > 0 && (
                            <div className="py-0.5 px-1 @min-[700px]:py-1 @min-[700px]:px-1.5 rounded-xs @min-[700px]:rounded-md bg-event-more-bg text-event-more-text text-[8px] @min-[700px]:text-[11px] text-center font-bold leading-none">
                                +{extraCount} more
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

export default Cell;
