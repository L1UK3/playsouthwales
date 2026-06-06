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
