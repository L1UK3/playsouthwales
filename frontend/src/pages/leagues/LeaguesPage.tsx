import React from 'react';
import type { LeaguesPageProps } from './LeaguesPageProps';
import styles from './LeaguesPage.module.css';

const LeaguesPage: React.FC<LeaguesPageProps> = ({ leagues }) => {
    return (
        <div className={`${styles.tabContent} ${styles.active}`}>
            <div className={styles.leaguesContainer}>
                {leagues.map(league => (
                    <div key={league.leagueId} className={styles.leagueCard}>
                        <h3>{league.name}</h3>
                        {league.website && (
                            <a href={league.website} target="_blank" rel="noopener noreferrer">
                                Website
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeaguesPage;
