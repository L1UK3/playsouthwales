import React from 'react';
import type { LeaguesPageProps } from './LeaguesPageProps';
import styles from './LeaguesPage.module.css';

/**
 * LeaguesPage component displays a list of participating leagues/stores.
 * @param props - The properties passed to the component including the list of leagues.
 * @returns JSX.Element
 */
const LeaguesPage: React.FC<LeaguesPageProps> = ({ leagues }) => {
    return (
        <div className={`${styles.tabContent} ${styles.active}`}>
            <div className={styles.leaguesContainer}>
                {leagues.map(league => (
                    <div key={league.leagueId} className={`${styles.leagueCard} card-container`}>
                        <h3>{league.name}</h3>
                        {league.website && (
                            <a href={league.website} target="_blank" rel="noopener noreferrer">
                                Website
                            </a>
                        )}
                    </div>
                ))}
            </div>
            {leagues.length === 0 && (
                <div className={styles.noLeagues}>
                    <p>No leagues found.</p>
                </div>
            )}
            <div>Map view goes here</div>
        </div>
    );
};

export default LeaguesPage;
