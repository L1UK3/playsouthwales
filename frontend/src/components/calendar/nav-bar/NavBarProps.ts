export interface NavBarProps {
    monthName: string;
    year: number;
    viewMode: 'calendar' | 'list';
    onGoToToday: () => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onToggleViewMode: () => void;
}
