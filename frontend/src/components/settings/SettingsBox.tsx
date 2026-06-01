import React from 'react';
import styles from './SettingsBox.module.css';
import type { SettingsBoxProps } from './SettingsBoxProps';

const SettingsBox: React.FC<SettingsBoxProps> = ({ onClose }) => {
    return (
        <div className={styles.settingsMenu}>
            <button className={styles.menuItem} onClick={onClose}>
                <span className={styles.icon}>🌙</span>
                Theme
            </button>
            <div className={styles.divider} />
            <button className={styles.menuItem} onClick={onClose}>
                <span className={styles.icon}>🔔</span>
                Notifications
            </button>
            <button className={styles.menuItem} onClick={onClose}>
                <span className={styles.icon}>📍</span>
                Location
            </button>
            <div className={styles.divider} />
            <button className={styles.menuItem} onClick={onClose}>
                <span className={styles.icon}>ℹ️</span>
                About
            </button>
        </div>
    );
};

export default SettingsBox;
