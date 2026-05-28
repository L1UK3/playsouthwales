import React from 'react';
import styles from './LeagueCard.module.css';
import type { LeagueCardProps } from './LeagueCardProps';

/**
 * LeagueCard component displays individual league information.
 * @param props - The properties for the LeagueCard component.
 * @returns JSX.Element
 */
const LeagueCard: React.FC<LeagueCardProps> = ({
    league,
    selectedLeagueID,
    onLeagueSelect,
}) => {
    const isSelected = selectedLeagueID === league.leagueId;

    return (
        <div
            id={`league-card-${league.leagueId}`}
            className={`${styles.leagueCard} ${isSelected ? styles.selectedCard : ''}`}
            onClick={() => onLeagueSelect(league.leagueId)}
        >
            <div className={styles.leagueHeader}>
                {league.logo && <img src={league.logo} alt={league.name} className={styles.leagueLogo} />}
                <h3>{league.name}</h3>
            </div>
            {league.location && <p className={styles.leagueLocation}>📍 {league.location}</p>}
            <div className={styles.leagueActions}>
                {league.website && (
                    <a
                        href={league.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        onClick={(e) => e.stopPropagation()}
                    >
                        League Website
                    </a>
                )}
                {league.pokemonLink && (
                    <a
                        href={league.pokemonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Pokémon Website
                    </a>
                )}
            </div>
        </div>
    );
};

export default LeagueCard;
