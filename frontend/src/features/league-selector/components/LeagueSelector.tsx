import React from 'react';

import LeagueCard from '@/features/league-selector/components/LeagueCard';
import type { League } from '@/types/League';

export interface LeagueSelectorProps {
    leagues: League[];
    selectedLeagueId: number | null;
    setSelectedLeagueId: (id: number | null) => void;
    onEdit?: (league: League) => void;
    onDelete?: (league: League) => void;
    onAdd?: () => void;
    showAdminControls?: boolean;
    columns?: number;
    showInfo?: boolean;
    layout?: 'grid' | 'scroll';
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
    columns,
    showInfo,
    layout = 'grid',
}) => {
    const gridColsClass =
        {
            1: 'grid-cols-1',
            2: 'grid-cols-1 sm:grid-cols-2',
            3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
            4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        }[columns ?? 3] ?? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';

    const sortedLeagues = React.useMemo(() => {
        return [...leagues].sort((a, b) => a.name.localeCompare(b.name));
    }, [leagues]);

    const isScroll = layout === 'scroll';

    return (
        <div className="flex flex-col gap-4">
            <div
                className={
                    isScroll
                        ? 'flex flex-row gap-4 overflow-x-auto pb-3 pt-1 px-1 scroll-smooth [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border-color/70 [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb:hover]:bg-text-muted'
                        : `grid ${gridColsClass} gap-4`
                }
            >
                {sortedLeagues.map((league) => (
                    <LeagueCard
                        key={league.leagueId}
                        league={league}
                        selectedLeagueID={selectedLeagueId}
                        onLeagueSelect={setSelectedLeagueId}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        showInfo={showInfo}
                        className={isScroll ? 'w-60 shrink-0' : ''}
                    />
                ))}

                {showAdminControls && (
                    <div
                        className={
                            isScroll
                                ? 'flex flex-col items-center justify-center min-h-30 w-60 shrink-0 rounded-lg border-2 border-dashed border-border-color bg-transparent text-text-muted cursor-pointer transition-[border-color,color,background-color,transform,box-shadow] duration-200 ease-out hover:border-primary hover:text-primary hover:bg-[rgba(227,53,13,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(227,53,13,0.08)]'
                                : 'flex flex-col items-center justify-center min-h-30 rounded-lg border-2 border-dashed border-border-color bg-transparent text-text-muted cursor-pointer transition-[border-color,color,background-color,transform,box-shadow] duration-200 ease-out hover:border-primary hover:text-primary hover:bg-[rgba(227,53,13,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(227,53,13,0.08)]'
                        }
                        onClick={onAdd}
                    >
                        {/* TODO: #40 Championship series should always be displayed after regular leagues and before 'add new league' */}
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
