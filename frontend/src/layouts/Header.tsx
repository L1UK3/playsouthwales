import React from 'react';
import { useLocation, Link } from '@tanstack/react-router';
import { SignInButton, UserButton, useAuth } from '@clerk/react';
import styles from './Header.module.css';
import TabToggle from '@/components/tab-toggle/TabToggle';

import SettingsBox from '@/components/settings/SettingsBox';

/**
 * Properties for the Header component, managing top-level navigation between different sections of the application.
 * 
 * @property {string} activeTab - The currently selected navigation tab ('schedule' or 'leagues').
 * @property {() => void} onTabChange - Callback function to handle switching between navigation tabs.
 * @property {() => void} onSettingsBox - Callback function to handle opening the settings dropdown.
 * @property {boolean} isSettingsOpen - Whether the settings dropdown is currently open.
 * @property {() => void} onCloseSettings - Callback function to close the settings dropdown.
 */
export interface HeaderProps {
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
    onSettingsBox,
    isSettingsOpen = false,
    onCloseSettings = () => undefined
}) => {
    const location = useLocation();
    const path = location.pathname;
    const { isLoaded, isSignedIn } = useAuth();
    const title = path.includes('leagues') ? 'Leagues' :
        path.includes('rankings') ? 'Rankings' :
            path.includes('schedule') ? 'Schedule' :
                path.includes('admin') ? 'Admin' :
                    "Pairings";

    return (
        <header className={styles.header}>
            <div className={styles.topNav}>
                <h1>Play! Wales | {title}</h1>

                <TabToggle tabs={[
                    { to: '/schedule', label: 'Schedule' },
                    { to: '/leagues', label: 'Leagues' },
                    { to: '/rankings', label: 'Rankings' },
                    { to: '/pairings', label: 'Pairings' }
                ]} activeTab={path} />

                <div className={styles.configTabs}>
                    {isLoaded && isSignedIn && (
                        <>
                            <Link
                                to="/admin"
                                className={`${styles.adminButton} ${path.startsWith('/admin') ? styles.active : ''}`}
                            >
                                Admin
                            </Link>
                            <UserButton />
                        </>
                    )}
                    {isLoaded && !isSignedIn && (
                        <SignInButton mode="modal">
                            <button type="button" className={styles.adminButton}>
                                Sign In
                            </button>
                        </SignInButton>
                    )}
                    <div className={styles.dropdownAnchor}>
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
