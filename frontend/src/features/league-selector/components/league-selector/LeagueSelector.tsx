import React from 'react';
import styles from './LeagueSelector.module.css';
import LeagueCard from '@/features/league-selector/components/league-card/LeagueCard';
import type { League } from '@/types/League';

export interface LeagueSelectorProps {
    leagues: League[];
    selectedLeagueId: number | null;
    setSelectedLeagueId: (id: number) => void;
    onEdit?: (league: League) => void;
    onDelete?: (league: League) => void;
    onAdd?: () => void;
    showAdminControls?: boolean;
}

/**
 * LeagueSelector component displays a grid of all participating leagues.
 * Clicking a card selects it as the active league to manage events.
 */
export const LeagueSelector: React.FC<LeagueSelectorProps> = ({
    leagues,
    selectedLeagueId,
    setSelectedLeagueId,
    onEdit,
    onDelete,
    onAdd,
    showAdminControls,
}) => {
    return (
        <div className={styles.leaguesSection}>
            <div className={styles.leaguesGrid}>
                {leagues.map(league => (
                    <LeagueCard
                        key={league.leagueId}
                        league={league}
                        selectedLeagueID={selectedLeagueId}
                        onLeagueSelect={setSelectedLeagueId}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}

                {showAdminControls && (
                    <div
                        className={`${styles.selectableCard} ${styles.addLeagueCard}`}
                        onClick={onAdd}
                    >
                        <div className={styles.addLeagueContent}>
                            <span className={styles.addLeagueIcon}>+</span>
                            <span>Add New League</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeagueSelector;
