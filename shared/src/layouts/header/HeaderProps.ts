/**
 * Properties for the Header component, managing top-level navigation between different sections of the application.
 * 
 * @property {string} activeTab - The currently selected navigation tab ('schedule' or 'leagues').
 * @property {() => void} onTabChange - Callback function to handle switching between navigation tabs.
 * @property {() => void} onLoginBox - Callback function to handle opening the admin login modal.
 * @property {() => void} onSettingsBox - Callback function to handle opening the settings dropdown.
 * @property {boolean} isSettingsOpen - Whether the settings dropdown is currently open.
 * @property {() => void} onCloseSettings - Callback function to close the settings dropdown.
 */
export interface HeaderProps {
    activeTab?: 'schedule' | 'leagues' | 'rankings';
    onTabChange?: (tab: 'schedule' | 'leagues' | 'rankings') => void;
    onLoginBox?: () => void;
    onSettingsBox?: () => void;
    isSettingsOpen?: boolean;
    onCloseSettings?: () => void;
}
