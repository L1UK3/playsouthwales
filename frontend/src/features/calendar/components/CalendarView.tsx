import React, { useMemo, useRef } from 'react';
import type { Event } from '@/types/Event';
import type { League } from '@/types/League';
import { getLocalDateString } from '@calendar/utils/getLocalDateString';
import type { CellData } from '@calendar/types/CellData';
import Cell from '@calendar/components/Cell';
import PokeballOverlay from '@calendar/components/PokeballOverlay';
import type { EventTypeMap } from '@/types/EventTypeMap';

/**
 * Properties for the CalendarView component.
 * @property currentDate - The currently viewed month and year.
 * @property events - A mapping of date keys (YYYY-MM-DD) to arrays of events for those dates.
 * @property leagueMap - A mapping of league IDs to league details for branding.
 * @property types - A mapping of event type keys to their display names or icons.
 * @property selectedDateKey - The dateKey of the currently selected day.
 * @property onSelectDay - Callback function triggered when a day is selected.
 */
export interface CalendarViewProps {
    currentDate: Date;
    events: Record<string, Event[]>;
    leagueMap: Record<number, League>;
    types: EventTypeMap;
    selectedDateKey: string | null;
    onSelectDay: (dateKey: string) => void;
}

/**
 * CalendarView component manages the logic for generating the calendar grid data.
 * It calculates the days for the current month, including padding for previous and next months,
 * and passes the processed data to the CalendarRenderer.
 * @param {CalendarViewProps} props - The properties passed to the component, including the current date, events, and selection handlers.
 * @returns {JSX.Element} The rendered calendar view.
 */
const CalendarView: React.FC<CalendarViewProps> = ({
    currentDate,
    events,
    leagueMap,
    types,
    selectedDateKey,
    onSelectDay
}) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const startDay = firstDay === 0 ? 6 : firstDay - 1;

    const today = useMemo(() => new Date(), []);
    const todayKey = getLocalDateString(today);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const generateCellData = (day: number, m: number, y: number, isOtherMonth: boolean): CellData => {
        const cellDate = new Date(y, m - 1, day);
        return {
            day,
            month: m,
            year: y,
            isOtherMonth,
            dateKey: getLocalDateString(cellDate)
        };
    };

    const cells: CellData[] = [];

    for (let i = startDay - 1; i >= 0; i--) {
        cells.push(generateCellData(daysInPrevMonth - i, month, year, true));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        cells.push(generateCellData(day, month + 1, year, false));
    }

    const totalCells = cells.length;
    const remainingCells = (Math.ceil(totalCells / 7) * 7) - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        cells.push(generateCellData(day, month + 2, year, true));
    }

    return (
        <div className="relative bg-bg-card rounded-lg shadow-main overflow-hidden lg:flex lg:flex-col" ref={wrapperRef}>
            <div className="grid grid-cols-7 bg-bg-day-header border-b border-border-color text-center text-text-muted font-bold border-2 rounded-t-lg shrink-0">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} className="py-2.5 px-2 text-xs uppercase tracking-wider">{d}</div>
                ))}
            </div>
            <div
                className="relative grid grid-cols-7 grid-rows-[repeat(auto-fill,minmax(0,1fr))] lg:grid-rows-[repeat(var(--num-rows,5),minmax(0,1fr))]! gap-px bg-border-color border-2 border-border-color border-t-0 rounded-b-lg overflow-hidden lg:flex-1"
                style={{ '--num-rows': cells.length / 7 } as React.CSSProperties}
            >
                {cells.map(cell => (
                    <Cell
                        key={cell.dateKey}
                        day={cell.day}
                        dateKey={cell.dateKey}
                        isOtherMonth={cell.isOtherMonth}
                        eventsForDay={events[cell.dateKey] ?? []}
                        leagueMap={leagueMap}
                        types={types}
                        selectedDateKey={selectedDateKey}
                        todayKey={todayKey}
                        onSelectDay={onSelectDay}
                    />
                ))}
            </div>
            <PokeballOverlay containerRef={wrapperRef} selectedDateKey={selectedDateKey} todayKey={todayKey} />
        </div>
    );
};

export default CalendarView;
