import React from 'react';

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
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                        className="flex flex-col items-center justify-center min-h-30 rounded-lg border-2 border-dashed border-border-color bg-transparent text-text-muted cursor-pointer transition-all duration-300 hover:border-primary hover:text-primary hover:bg-[rgba(227,53,13,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(227,53,13,0.08)]"
                        onClick={onAdd}
                    >
                        <div className="flex flex-col items-center gap-2 font-bold text-[15px]">
                            <span className="text-2xl font-normal">+</span>
                            <span>Add New League</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeagueSelector;