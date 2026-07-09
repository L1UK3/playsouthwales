import React from 'react';
import { RankBadge } from './RankBadge';
import { useLeaderboard } from '../hooks/useLeaderboard';
import SuspenseLoader from '@/components/SuspenseLoader';
import { SkeletonRow } from './SkeletonRow';

export interface LeaderboardProps {
    leagueId?: number | string;
    season?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leagueId = 'global', season }) => {
    const { data: players = [], isLoading } = useLeaderboard(leagueId, season);
    const isGlobal = leagueId === 'global';

    if (isLoading) {
        return (
            <SuspenseLoader message="Loading leaderboard..." />
        )
    }

    return (
        <div className='flex flex-col gap-4 w-full h-full min-h-0'>
            {/* Leaderboard Table Container */}
            <div className='flex-1 min-h-0 overflow-auto rounded-lg border border-border-color bg-bg-card shadow-xs [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border-color/70 [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb:hover]:bg-text-muted'>
                <table className='w-full border-collapse text-left'>

                    <thead className='sticky top-0 bg-bg-card border-b border-border-color z-10'>
                        <tr className='text-[11px] font-bold text-text-muted uppercase tracking-wider bg-bg-main/50 backdrop-blur-md'>
                            <th className='py-2 px-3 w-16 text-center'>Rank</th>
                            {!isGlobal && <th className='py-2 px-3'>Player</th>}
                            {isGlobal ? (
                                <th className='py-2 px-3 text-right pr-4'>Championship Points</th>
                            ) : (
                                <>
                                    <th className='py-2 px-3 text-center w-12 hidden md:table-cell'>W</th>
                                    <th className='py-2 px-3 text-center w-12 hidden md:table-cell'>L</th>
                                    <th className='py-2 px-3 text-center w-12 hidden md:table-cell'>D</th>
                                    <th className='py-2 px-3 text-center w-24 hidden sm:table-cell'>Attendance</th>
                                    <th className='py-2 px-3 text-right pr-4 w-20'>Points</th>
                                </>
                            )}
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-border-color/50'>
                        {isLoading ? (
                            [1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
                                <SkeletonRow key={id} isGlobal={isGlobal} />
                            ))
                        ) : players.length === 0 ? (
                            <tr>
                                <td colSpan={isGlobal ? 2 : 7} className='text-center py-12 text-sm text-text-muted'>
                                    No players found.
                                </td>
                            </tr>
                        ) : (
                            players.map((player) => {
                                const renderCutoff = isGlobal && player.position === 21;

                                return (
                                    <React.Fragment key={player.position}>
                                        {renderCutoff && (
                                            <tr className="bg-bg-main/30">
                                                <td colSpan={2} className="py-2 px-3 text-center text-xs font-bold text-text-muted border-t border-b border-border-color border-dashed uppercase tracking-wider select-none">
                                                    Top 20 Cutoff
                                                </td>
                                            </tr>
                                        )}
                                        <tr
                                            key={player.position}
                                            className={`hover:bg-bg-card-hover/60 transition-colors duration-150 group cursor-pointer ${isGlobal && player.position > 20 ? "opacity-75" : ""}`}
                                        >
                                            <td className='py-1.5 px-3 flex justify-center items-center'>
                                                <RankBadge position={player.position} />
                                            </td>
                                            {!isGlobal && (
                                                <td className='py-1.5 px-3 text-sm font-semibold text-text-main group-hover:text-text-darker transition-colors duration-150'>
                                                    <div className='flex items-center gap-2'>
                                                        <span>{player.name}</span>
                                                    </div>
                                                </td>
                                            )}
                                            {isGlobal ? (
                                                <td className='py-1.5 px-3 text-right pr-4 text-sm font-bold text-primary'>
                                                    <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary/5 text-primary border border-primary/10'>
                                                        {player.cp}
                                                    </span>
                                                </td>
                                            ) : (
                                                <>
                                                    <td className='py-1.5 px-3 text-center text-sm font-medium text-text-main hidden md:table-cell'>
                                                        {player.wins ?? 0}
                                                    </td>
                                                    <td className='py-1.5 px-3 text-center text-sm font-medium text-text-main hidden md:table-cell'>
                                                        {player.losses ?? 0}
                                                    </td>
                                                    <td className='py-1.5 px-3 text-center text-sm font-medium text-text-main hidden md:table-cell'>
                                                        {player.draws ?? 0}
                                                    </td>
                                                    <td className='py-1.5 px-3 text-center text-sm font-medium text-text-main hidden sm:table-cell'>
                                                        {player.attendance ?? 0}
                                                    </td>
                                                    <td className='py-1.5 px-3 text-right pr-4 text-sm font-bold text-primary'>
                                                        <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary/5 text-primary border border-primary/10'>
                                                            {player.points}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;
