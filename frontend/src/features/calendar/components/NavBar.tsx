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
        <div className="flex gap-2 flex-wrap items-center max-[900px]:flex-col max-[900px]:items-stretch [&_h2]:mr-auto">
            <h2 className="text-lg font-bold text-text-darker">{monthName} {year}</h2>
            <button className="btn btn-secondary" onClick={onGoToToday}>Today</button>
            <button className="btn btn-secondary" onClick={onPrevMonth}>&larr;</button>
            <button className="btn btn-secondary" onClick={onNextMonth}>&rarr;</button>
            {viewMode && onToggleViewMode && (
                <button
                    className={"btn btn-primary ml-2 max-[900px]:ml-0"}
                    onClick={onToggleViewMode}
                >
                    {viewMode === 'calendar' ? 'List' : 'Calendar'}
                </button>
            )}
        </div>
    );
};

export default NavBar;
