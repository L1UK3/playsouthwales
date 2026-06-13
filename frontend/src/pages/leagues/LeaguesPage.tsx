import React, { useState, useCallback } from 'react';
import styles from '@pages/leagues/LeaguesPage.module.css';
import { useLeagues } from '@hooks/useLeagues';
import LeagueMap from '@map/components/LeagueMap';
import { LeagueSelector } from '@features/league-selector';

/**
 * LeaguesPage component displays a list of participating leagues/stores.
 * @returns {JSX.Element} The rendered LeaguesPage.
 */
const LeaguesPage: React.FC = () => {
    const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
    const { data: leagues = [] } = useLeagues();

    const handleLeagueSelect = useCallback((id: number) => {
        setSelectedLeagueId(id);

        const cardElement = document.getElementById(`league-card-${id}`);
        if (cardElement) {
            cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, []);

    return (
        <div className={styles.splitView}>
            <div className={styles.listSection}>

                <LeagueSelector
                    leagues={leagues}
                    selectedLeagueId={selectedLeagueId}
                    setSelectedLeagueId={handleLeagueSelect}
                />


                {leagues.length === 0 ? (
                    <div className={styles.noLeagues}>
                        <p>No leagues found.</p>
                    </div>
                ) : null}
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
