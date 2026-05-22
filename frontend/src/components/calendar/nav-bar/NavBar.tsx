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
            <button className="btn btn-secondary" onClick={onGoToToday}>Today</button>
            <button className="btn btn-secondary" onClick={onPrevMonth}>&larr;</button>
            <button className="btn btn-secondary" onClick={onNextMonth}>&rarr;</button>
            <button 
                className={`${styles.calendarToggle} btn btn-primary`} 
                onClick={onToggleViewMode}
            >
                Switch to {viewMode === 'calendar' ? 'List' : 'Calendar'}
            </button>
        </div>
    );
};

export default NavBar;
