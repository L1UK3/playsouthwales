import React from 'react';
import styles from './NavBar.module.css';

/**
 * Properties for the NavBar component, providing navigation controls for the calendar and list views.

 * @property monthName - The display name of the currently active month.
 * @property year - The currently active year.
 * @property viewMode - The current layout mode, either 'calendar' or 'list'.
 * @property onGoToToday - Callback to reset the view to the current date.
 * @property onPrevMonth - Callback to navigate to the previous month.
 * @property onNextMonth - Callback to navigate to the next month.
 * @property onToggleViewMode - Callback to switch between calendar and list view modes.
 */
export interface NavBarProps {
    monthName: string;
    year: number;
    viewMode: 'calendar' | 'list';
    onGoToToday: () => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onToggleViewMode: () => void;
}

/**
 * NavBar component provides navigation controls for the calendar,
 * including month switching, returning to today, and toggling between view modes.
 * @param props - The properties passed to the component including navigation handlers and current view state.
 * @returns JSX.Element
 */
const NavBar: React.FC<NavBarProps> = ({
    monthName,
    year,
    viewMode,
    onGoToToday,
    onPrevMonth,
    onNextMonth,
    onToggleViewMode
}) => {
    return (
        <div className={styles.navBar}>
            <h2>{monthName} {year}</h2>
            <button className="btn btn-secondary" onClick={onGoToToday}>Today</button>
            <button className="btn btn-secondary" onClick={onPrevMonth}>&larr;</button>
            <button className="btn btn-secondary" onClick={onNextMonth}>&rarr;</button>
            <button
                className={`${styles.calendarToggle} btn btn-primary`}
                onClick={onToggleViewMode}
            >
                {viewMode === 'calendar' ? 'List' : 'Calendar'}
            </button>
        </div>
    );
};

export default NavBar;
