/**
 * Properties for the Header component, managing top-level navigation between different sections of the application.
 * 
 * @property activeTab - The currently selected navigation tab ('schedule' or 'leagues').
 * @property onTabChange - Callback function to handle switching between navigation tabs.
 */
export interface HeaderProps {
    activeTab: 'schedule' | 'leagues';
    onTabChange: (tab: 'schedule' | 'leagues') => void;
}
