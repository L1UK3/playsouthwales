import React from 'react';
import styles from '@components/suspense-loader/SuspenseLoader.module.css';

export interface SuspenseLoaderProps {
    fullPage?: boolean;
    message?: string;
}

const SuspenseLoader: React.FC<SuspenseLoaderProps> = ({
    fullPage = false,
    message = 'Loading...'
}) => {
    return (
        <div className={`${styles.loaderWrapper} ${fullPage ? styles.fullPage : ''}`}>
            <div className={styles.spinnerContainer}>
                <div className={styles.glow} />
                <div className={styles.spinner} />
            </div>
            {message ? <div className={styles.text}>{message}</div> : null}
        </div>
    );
};

export default SuspenseLoader;
