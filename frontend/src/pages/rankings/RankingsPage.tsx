import React from 'react';
import styles from '@pages/rankings/RankingsPage.module.css';
import Leaderboard from '@leaderboard/Leaderboard';


const RankingsPage: React.FC = () => {
    return (
        <div className={`${styles.tabContent} ${styles.active}`}>
            <div className={styles.content}>
                <Leaderboard />
            </div>
        </div>
    );
};

export default RankingsPage;
