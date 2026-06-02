import React from 'react';
import { getLocalDateString } from '@utils/getLocalDateString';
import type { CalendarViewProps } from './CalendarViewProps';
import type { CellData } from '@/types/CellData';
import styles from './CalendarView.module.css';
import Cell from '@/components/calendar/cell/Cell';


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

    const todayKey = getLocalDateString(new Date());

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

export default CalendarView;
