import React from 'react';
import type { LeaguesPageProps } from './LeaguesPageProps';
import styles from './LeaguesPage.module.css';
import LeagueMap from '@components/leagues-map/LeagueMap';
import LeagueCard from '@/components/league-card/LeagueCard';

/**
 * LeaguesPage component displays a list of participating leagues/stores.
 * @param props - The properties passed to the component including the list of leagues.
 * @returns JSX.Element
 */
const LeaguesPage: React.FC<LeaguesPageProps> = ({ leagues }) => {
    const [selectedLeagueId, setSelectedLeagueId] = React.useState<number | null>(null);

    const handleLeagueSelect = (id: number) => {
        setSelectedLeagueId(id);

        const cardElement = document.getElementById(`league-card-${id}`);
        if (cardElement) {
            cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    };

    return (
        <div className={`${styles.tabContent} ${styles.active} ${styles.splitView}`}>
            <div className={styles.listSection}>
                <div className={styles.leaguesContainer}>
                    {leagues.map(league => (
                        <LeagueCard
                            key={league.leagueId}
                            league={league}
                            selectedLeagueID={selectedLeagueId}
                            onLeagueSelect={handleLeagueSelect}
                        />
                    ))}
                </div>
                
                {leagues.length === 0 && (
                    <div className={styles.noLeagues}>
                        <p>No leagues found.</p>
                    </div>
                )}
            </div>

            <div className={styles.mapSection}>
                <LeagueMap 
                    leagues={leagues} 
                    selectedLeagueId={selectedLeagueId}
                    onLeagueSelect={setSelectedLeagueId}
                />
            </div>
        </div>
    );
};

export default LeaguesPage;
