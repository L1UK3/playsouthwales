import React from 'react';
import type { HeaderProps } from './HeaderProps';
import SettingsBox from '@components/settings/SettingsBox';
import styles from './Header.module.css';

/**
 * Wrapper for the header component
 * @param {HeaderProps} props - The properties passed to the component including activeTab and onTabChange.
 * @returns {JSX.Element} The header element.
 */
const Header: React.FC<HeaderProps> = ({
    activeTab,
    onTabChange,
    onLoginBox,
    toggleSettingsBox,
    isSettingsOpen
}) => {
    return (
        <header className={styles.header}>
            <div className={styles.topNav}>
                <h1>Play! Wales | {activeTab === 'schedule' ? 'Schedule' : 'Leagues'}</h1>
                <div className={styles.tabToggle}>
                    <button
                        className={activeTab === 'schedule' ? styles.active : ''}
                        onClick={() => onTabChange('schedule')}>
                        Schedule
                    </button>

                    <button
                        className={activeTab === 'leagues' ? styles.active : ''}
                        onClick={() => onTabChange('leagues')}>
                        Leagues
                    </button>
                </div>
                <div className={styles.configTabs}>
                    <button
                        className={styles.adminButton}
                        onClick={onLoginBox}>
                        Admin
                    </button>

                    <div className={styles.dropdownAnchor}>
                        <button
                            className={`${styles.settingsButton} ${isSettingsOpen ? styles.active : ''}`}
                            onClick={toggleSettingsBox}>
                            ⚙️
                        </button>
                        {isSettingsOpen && (
                            <div className={styles.dropdown}>
                                <SettingsBox onClose={toggleSettingsBox} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
