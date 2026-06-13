import React from 'react';
import styles from './LeagueSelector.module.css';
import LeagueCard from '@/features/league-selector/components/league-card/LeagueCard';
import type { League } from '@/types/League';

export interface LeagueSelectorProps {
    leagues: League[];
    selectedLeagueId: number | null;
    setSelectedLeagueId: (id: number) => void;
}

/**
 * LeagueSelector component displays a grid of all participating leagues.
 * Clicking a card selects it as the active league to manage events.
 */
export const LeagueSelector: React.FC<LeagueSelectorProps> = ({
    leagues,
    selectedLeagueId,
    setSelectedLeagueId,
}) => {
    return (
        <div className={styles.leaguesSection}>
            <div className={styles.leaguesGrid}>
                {leagues.map(league => (
                    <div
                        key={league.leagueId}
                        onClick={() => setSelectedLeagueId(league.leagueId)}
                        className={`${styles.selectableCard} ${selectedLeagueId === league.leagueId ? styles.activeCard : ''}`}
                        style={{
                            '--active-border-color': league.brandColor ?? 'var(--primary)',
                            '--brand-color': league.brandColor ?? 'var(--primary)'
                        } as React.CSSProperties}
                    >
                        <LeagueCard
                            key={league.leagueId}
                            league={league}
                            selectedLeagueID={selectedLeagueId}
                            onLeagueSelect={setSelectedLeagueId}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeagueSelector;
