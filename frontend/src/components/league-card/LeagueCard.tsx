import React from 'react';
import styles from './LeagueCard.module.css';
import type { LeagueCardProps } from './LeagueCardProps';

/**
 * LeagueCard component displays individual league information.
 * @param props - The properties for the LeagueCard component.
 * @returns JSX.Element
 */
const LeagueCard: React.FC<LeagueCardProps> = ({ league }) => {
    return (
        <div className={styles.leagueCard}>
            <div className={styles.leagueHeader}>
                {league.logo && <img src={league.logo} alt={league.name} className={styles.leagueLogo} />}
                <h3>{league.name}</h3>
            </div>
            {league.location && <p className={styles.leagueLocation}>📍 {league.location}</p>}
            <div className={styles.leagueActions}>
                {league.website && (
                    <a href={league.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                        League Website
                    </a>
                )}
                {league.pokemonLink && (
                    <a href={league.pokemonLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                        Pokémon Website
                    </a>
                )}
            </div>
        </div>
    );
};

export default LeagueCard;
