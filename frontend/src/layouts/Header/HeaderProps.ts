
export interface HeaderProps {
    activeTab: 'schedule' | 'leagues';
    onTabChange: (tab: 'schedule' | 'leagues') => void;
}
