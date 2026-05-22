import React from 'react';
import type { HeaderProps } from './HeaderProps';
import styles from './Header.module.css';

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
    return (
        <header>
            <div className={styles.topNav}>
                <h1>Play! Wales | {activeTab === 'schedule' ? 'Schedule' : 'Leagues'}</h1>
                <div className={styles.tabToggle}>
                    <button
                        className={activeTab === 'schedule' ? styles.active : ''}
                        onClick={() => onTabChange('schedule')}
                    >Schedule</button>
                    <button
                        className={activeTab === 'leagues' ? styles.active : ''}
                        onClick={() => onTabChange('leagues')}
                    >Leagues</button>
                </div>
                <div className={styles.configTabs}>
                    <button className={styles.adminButton}>Admin</button>
                    <button className={styles.settingsButton}>⚙️</button>
                </div>
            </div>
        </header>
    );
};

export default Header;
