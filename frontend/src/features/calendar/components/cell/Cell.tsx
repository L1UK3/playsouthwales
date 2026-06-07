import React from "react";
import styles from "./Cell.module.css";
import Card from "../event-card/card/Card";
import type { Event } from "@/types/Event";
import type { League } from "@/types/League";
import type { EventTypes } from "@/types/EventTypes";

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
            className={`${styles.calendarCell} ${isOtherMonth ? styles.empty : ''} ${isSelected ? styles.selected : ''} ${isToday ? styles.today : ''}`}
            onClick={() => !isOtherMonth && onSelectDay(dateKey)}
        >
            <div className={styles.dateNumber}>{day}</div>
            {eventsForDay.length > 0 ? (
                <div className={styles.eventList}>
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
                        <div className={styles.eventSummary}>
                            {eventsForDay.length - 2} more event{eventsForDay.length - 2 === 1 ? '' : 's'}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
});

export default Cell;
