import React from 'react';
import type { Event, League, EventTypes } from '../../../types';
import Card from './Card';

interface CellProps {
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

const Cell: React.FC<CellProps> = ({
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
            className={`calendar-cell ${isOtherMonth ? 'empty' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
            onClick={() => !isOtherMonth && onSelectDay(dateKey)}
        >
            <div className="date-number">{day}</div>
            {eventsForDay.length > 0 && (
                <div className="event-list">
                    {eventsForDay.slice(0, 2).map((event) => (
                        <Card 
                            key={event.id}
                            event={event}
                            leagueMap={leagueMap}
                            types={types}
                        />
                    ))}
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

export default Cell;
