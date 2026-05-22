import React from 'react';
import Cell from './cell/Cell';
import type { CalendarRendererProps } from './CalendarRendererProps';
import styles from './CalendarRenderer.module.css';

const CalendarRenderer: React.FC<CalendarRendererProps> = ({
    cells,
    events,
    leagueMap,
    types,
    selectedDateKey,
    todayKey,
    onSelectDay
}) => {
    return (
        <div className={`${styles.calendar} card-container`}>
            <div className={styles.daysOfWeek}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} className={styles.dayName}>{d}</div>
                ))}
            </div>
            <div className={styles.calendarGrid} id="calendar-grid">
                {cells.map(cell => (
                    <Cell
                        key={cell.dateKey}
                        day={cell.day}
                        dateKey={cell.dateKey}
                        isOtherMonth={cell.isOtherMonth}
                        eventsForDay={events[cell.dateKey] || []}
                        leagueMap={leagueMap}
                        types={types}
                        selectedDateKey={selectedDateKey}
                        todayKey={todayKey}
                        onSelectDay={onSelectDay}
                    />
                ))}
            </div>
        </div>
    );
};

export default CalendarRenderer;
