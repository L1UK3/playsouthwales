import React from 'react';


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
    viewMode?: 'calendar' | 'list';
    onGoToToday: () => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onToggleViewMode?: () => void;
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
        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-between sm:items-center">
            <h2 className="text-base sm:text-lg font-bold text-text-darker m-0 shrink-0 text-center sm:text-left">
                {monthName} {year}
            </h2>
            <div className="flex items-center gap-1.5 justify-center sm:justify-end w-full sm:w-auto">
                <button className="btn btn-secondary py-1.5 px-3.5 text-xs sm:text-sm cursor-pointer flex-1 sm:flex-initial" onClick={onGoToToday}>Today</button>
                <button className="btn btn-secondary py-1.5 px-3.5 text-xs sm:text-sm cursor-pointer flex-1 sm:flex-initial" onClick={onPrevMonth}>&larr;</button>
                <button className="btn btn-secondary py-1.5 px-3.5 text-xs sm:text-sm cursor-pointer flex-1 sm:flex-initial" onClick={onNextMonth}>&rarr;</button>
                {viewMode && onToggleViewMode && (
                    <button
                        className="btn btn-primary py-1.5 px-3.5 text-xs sm:text-sm font-bold cursor-pointer flex-1 sm:flex-initial"
                        onClick={onToggleViewMode}
                    >
                        {viewMode === 'calendar' ? 'List' : 'Calendar'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default NavBar;
