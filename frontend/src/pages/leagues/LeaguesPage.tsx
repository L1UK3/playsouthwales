import React from 'react';
import type { LeaguesPageProps } from './LeaguesPageProps';
import styles from './LeaguesPage.module.css';
import LeagueMap from '../../components/leagues-map/LeagueMap';

/**
 * LeaguesPage component displays a list of participating leagues/stores.
 * @param props - The properties passed to the component including the list of leagues.
 * @returns JSX.Element
 */
const LeaguesPage: React.FC<LeaguesPageProps> = ({ leagues }) => {
    const [selectedLeagueId, setSelectedLeagueId] = React.useState<number | null>(null);

    const handleLeagueSelect = (id: number) => {
        setSelectedLeagueId(id);
        // Optional: Scroll the selected card into view in the list
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
                        <div 
                            key={league.leagueId} 
                            id={`league-card-${league.leagueId}`}
                            className={`${styles.leagueCard} card-container ${selectedLeagueId === league.leagueId ? styles.selectedCard : ''}`}
                            onClick={() => handleLeagueSelect(league.leagueId)}
                        >
                            <div className={styles.leagueHeader}>
                                {league.logo && <img src={league.logo} alt={league.name} className={styles.leagueLogo} />}
                                <h3>{league.name}</h3>
                            </div>
                            {league.location && <p className={styles.leagueLocation}>📍 {league.location}</p>}
                            <div className={styles.leagueActions}>
                                {league.website && (
                                    <a href={league.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                                        Website
                                    </a>
                                )}
                                {league.pokemonLink && (
                                    <a href={league.pokemonLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                                        Pokémon Events
                                    </a>
                                )}
                            </div>
                        </div>
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
