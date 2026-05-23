import React from 'react';
import Card from '../card/Card';
import type { CellProps } from './CellProps';
import styles from './Cell.module.css';

/**
 * Cell component represents an individual day in the calendar grid.
 * It displays the day number and a summary of events for that specific date.
 * @param props - The properties passed to the component including day, events, and selection state.
 * @returns JSX.Element
 */
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
            className={`${styles.calendarCell} ${isOtherMonth ? styles.empty : ''} ${isSelected ? styles.selected : ''} ${isToday ? styles.today : ''}`}
            onClick={() => !isOtherMonth && onSelectDay(dateKey)}
        >
            <div className={styles.dateNumber}>{day}</div>
            {eventsForDay.length > 0 && (
                <div className={styles.eventList}>
                    {eventsForDay.slice(0, 2).map((event) => (
                        <Card 
                            key={event.id}
                            event={event}
                            leagueMap={leagueMap}
                            types={types}
                        />
                    ))}
                    {eventsForDay.length > 2 && (
                        <div className={styles.eventSummary}>
                            {eventsForDay.length - 2} more event{eventsForDay.length - 2 === 1 ? '' : 's'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Cell;
