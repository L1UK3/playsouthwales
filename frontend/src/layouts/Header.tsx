import React, { useRef, useEffect } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import styles from './Header.module.css';

const SettingsBox = React.lazy(() => import('@/components/settings/SettingsBox'));

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
    onLoginBox,
    onSettingsBox,
    isSettingsOpen = false,
    onCloseSettings = () => undefined
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!isSettingsOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

        updateHeight();

        return () => {
            observer.disconnect();
        };
    }, []);

    const location = useLocation();
    const path = location.pathname;
    const title = path.includes('leagues') ? 'Leagues' : path.includes('rankings') ? 'Rankings' : 'Schedule';

    return (
        <header ref={headerRef} className={styles.header}>
            <div className={styles.topNav}>
                <h1>Play! Wales | {title}</h1>
                <div className={styles.tabToggle}>
                    <Link
                        to="/schedule"
                        activeProps={{ className: styles.active }}
                        className="">
                        Schedule
                    </Link>

                    <Link
                        to="/leagues"
                        activeProps={{ className: styles.active }}
                        className="">
                        Leagues
                    </Link>

                    <Link
                        to="/rankings"
                        activeProps={{ className: styles.active }}
                        className="">
                        Rankings
                    </Link>
                </div>
                <div className={styles.configTabs}>
                    <button className={styles.adminButton} onClick={onLoginBox}>
                        Login
                    </button>

                    <div className={styles.dropdownAnchor} ref={dropdownRef}>
                        <button
                            className={`${styles.settingsButton} ${isSettingsOpen ? styles.active : ''}`}
                            onClick={onSettingsBox}>
                            ⚙️
                        </button>
                        {isSettingsOpen ? (
                            <div className={styles.dropdown}>
                                <SettingsBox onClose={onCloseSettings} />
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
