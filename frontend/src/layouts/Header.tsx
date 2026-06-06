import React, { useRef, useEffect } from 'react';
import styles from './Header.module.css';
import SettingsBox from '@/features/settings/SettingsBox';

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

/**
 * Wrapper for the header component
 * @param {HeaderProps} props - The properties passed to the component including activeTab and onTabChange.
 * @returns {JSX.Element} The header element.
 */
const Header: React.FC<HeaderProps> = ({
    activeTab = 'schedule',
    onTabChange,
    onLoginBox,
    onSettingsBox,
    isSettingsOpen = false,
    onCloseSettings = () => {}
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isSettingsOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onCloseSettings();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSettingsOpen, onCloseSettings]);

    useEffect(() => {
        const headerEl = headerRef.current;
        if (!headerEl) return;

        const updateHeight = () => {
            const rect = headerEl.getBoundingClientRect();
            document.documentElement.style.setProperty('--header-height', `${rect.height}px`);
        };

        const observer = new ResizeObserver(updateHeight);
        observer.observe(headerEl);

        // Initial measurement
        updateHeight();

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <header ref={headerRef} className={styles.header}>
            <div className={styles.topNav}>
                <h1>Play! Wales | {activeTab === 'schedule' ? 'Schedule' : activeTab === 'leagues' ? 'Leagues' : activeTab === 'rankings' ? 'Rankings' : 'Schedule'}</h1>
                <div className={styles.tabToggle}>
                    <button
                        className={activeTab === 'schedule' ? styles.active : ''}
                        onClick={() => onTabChange?.('schedule')}>
                        Schedule
                    </button>

                    <button
                        className={activeTab === 'leagues' ? styles.active : ''}
                        onClick={() => onTabChange?.('leagues')}>
                        Leagues
                    </button>

                    <button
                        className={activeTab === 'rankings' ? styles.active : ''}
                        onClick={() => onTabChange?.('rankings')}>
                        Rankings
                    </button>
                </div>
                <div className={styles.configTabs}>
                    <button
                        className={styles.adminButton}
                        onClick={onLoginBox}>
                        Admin
                    </button>

                    <div className={styles.dropdownAnchor} ref={dropdownRef}>
                        <button
                            className={`${styles.settingsButton} ${isSettingsOpen ? styles.active : ''}`}
                            onClick={onSettingsBox}>
                            ⚙️
                        </button>
                        {isSettingsOpen && (
                            <div className={styles.dropdown}>
                                <SettingsBox onClose={onCloseSettings} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
