import React, { useState, useCallback } from 'react';
import styles from './LeaguesPage.module.css';
import { useFetch } from '@hooks/useFetch';
import LeagueCard from '@/features/league-map/components/league-card/LeagueCard';
import LeagueMap from '@/features/league-map/components/map/LeagueMap';

/**
 * LeaguesPage component displays a list of participating leagues/stores.
 * @returns {JSX.Element} The rendered LeaguesPage.
 */
const LeaguesPage: React.FC = () => {
    const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);

    const { leagues } = useFetch(new Date());

    const handleLeagueSelect = useCallback((id: number) => {
        setSelectedLeagueId(id);

        const cardElement = document.getElementById(`league-card-${id}`);
        if (cardElement) {
            cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, []);

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
