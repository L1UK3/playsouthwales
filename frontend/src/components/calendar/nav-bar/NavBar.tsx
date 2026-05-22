import React from 'react';
import styles from './NavBar.module.css';
import type { NavBarProps } from './NavBarProps';

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
            <button onClick={onGoToToday}>Today</button>
            <button onClick={onPrevMonth}>&larr;</button>
            <button onClick={onNextMonth}>&rarr;</button>
            <button 
                className={styles.calendarToggle} 
                onClick={onToggleViewMode}
            >
                Switch to {viewMode === 'calendar' ? 'List' : 'Calendar'}
            </button>
        </div>
    );
};

export default NavBar;
