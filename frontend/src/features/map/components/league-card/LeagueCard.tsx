import React from 'react';
import styles from '@map/components/league-card/LeagueCard.module.css';
import type { League } from '@/types/League';

/**
 * @interface LeagueCardProps
 * @description Properties for the LeagueCard component.
 * @property {number} key - Unique identifier for the component instance.
 * @property {League} league - The league object containing details to display.
 * @property {number | null} selectedLeagueID - The ID of the currently selected league.
 * @property {(id: number) => void} onLeagueSelect - Callback function triggered when a league is selected.
 */
export interface LeagueCardProps {
    key: number;
    league: League;
    selectedLeagueID: number | null;
    onLeagueSelect: (id: number) => void;
}

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
    const brandColor = league.brandColor ?? 'var(--primary)';

    return (
        <div
            id={`league-card-${league.leagueId}`}
            className={`${styles.leagueCard} ${isSelected ? styles.selectedCard : ''}`}
            style={{ '--brand-color': brandColor } as React.CSSProperties}
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
