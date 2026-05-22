import React from 'react';
import type { Event, League, EventTypes } from '../../../types';
import { getLocalDateString } from '../../../utils/api';

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

    const renderDayCell = (day: number, m: number, y: number, isOtherMonth: boolean) => {
        const cellDate = new Date(y, m - 1, day);
        const dateKey = getLocalDateString(cellDate);
        const eventsForDay = events[dateKey] || [];
        const isSelected = dateKey === selectedDateKey;
        const isToday = dateKey === todayKey;

        return (
            <div 
                key={dateKey}
                className={`calendar-cell ${isOtherMonth ? 'empty' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => !isOtherMonth && onSelectDay(dateKey)}
            >
                <div className="date-number">{day}</div>
                {eventsForDay.length > 0 && (
                    <div className="event-list">
                        {eventsForDay.slice(0, 2).map((event, idx) => {
                            const storeColor = event.leagueId && leagueMap[event.leagueId]?.brandColor 
                                               ? leagueMap[event.leagueId].brandColor 
                                               : `hsl(${(event.leagueId || 0) * 137 % 360}, 70%, 50%)`;
                            return (
                                <div 
                                    key={idx} 
                                    className={`event type-${event.type}`} 
                                    style={{ '--store-color': storeColor } as React.CSSProperties}
                                >
                                    <span>{event.leagueName || 'Event'}</span>
                                    <span className="type">{types[event.type] || event.type}</span>
                                </div>
                            );
                        })}
                        {eventsForDay.length > 2 && (
                            <div className="event-summary">
                                {eventsForDay.length - 2} more event{eventsForDay.length - 2 === 1 ? '' : 's'}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const cells = [];
    // Prev month padding
    for (let i = startDay - 1; i >= 0; i--) {
        cells.push(renderDayCell(daysInPrevMonth - i, month, year, true));
    }
    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
        cells.push(renderDayCell(day, month + 1, year, false));
    }
    // Next month padding
    const totalCells = cells.length;
    const remainingCells = (Math.ceil(totalCells / 7) * 7) - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        cells.push(renderDayCell(day, month + 2, year, true));
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
