import React from 'react';
import type { Event, League, EventTypes } from '../../../types';
import { getLocalDateString } from '../../../utils/api';
import Cell from './Cell';

interface CalendarViewProps {
    currentDate: Date;
    events: Record<string, Event[]>;
    leagueMap: Record<number, League>;
    types: EventTypes;
    selectedDateKey: string | null;
    onSelectDay: (dateKey: string) => void;
}

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

    const todayKey = getLocalDateString(new Date());

    const renderCell = (day: number, m: number, y: number, isOtherMonth: boolean) => {
        const cellDate = new Date(y, m - 1, day);
        const dateKey = getLocalDateString(cellDate);
        return (
            <Cell
                key={dateKey}
                day={day}
                dateKey={dateKey}
                isOtherMonth={isOtherMonth}
                eventsForDay={events[dateKey] || []}
                leagueMap={leagueMap}
                types={types}
                selectedDateKey={selectedDateKey}
                todayKey={todayKey}
                onSelectDay={onSelectDay}
            />
        );
    };

    const cells = [];
    // Prev month padding
    for (let i = startDay - 1; i >= 0; i--) {
        cells.push(renderCell(daysInPrevMonth - i, month, year, true));
    }
    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
        cells.push(renderCell(day, month + 1, year, false));
    }
    // Next month padding
    const totalCells = cells.length;
    const remainingCells = (Math.ceil(totalCells / 7) * 7) - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        cells.push(renderCell(day, month + 2, year, true));
    }

    return (
        <div className="calendar">
            <div className="days-of-week">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} className="day-name">{d}</div>
                ))}
            </div>
            <div className="calendar-grid" id="calendar-grid">
                {cells}
            </div>
        </div>
    );
};

export default CalendarView;
