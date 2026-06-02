import React from 'react';
import styles from './SettingsBox.module.css';
import type { SettingsBoxProps } from './SettingsBoxProps';

const SettingsBox: React.FC<SettingsBoxProps> = ({ onClose }) => {
    return (
        <div className={styles.settingsMenu}>
            <button className={styles.menuItem} onClick={onClose}>
                High Contrast Mode
            </button>
            <button className={styles.menuItem} onClick={onClose}>
                Large Text Mode
            </button>
            <button className={styles.menuItem} onClick={onClose}>
                Dark Mode
            </button>
        </div>
    );
};

export default SettingsBox;
