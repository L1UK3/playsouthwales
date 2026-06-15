import React from 'react';
import { renderRankBadge } from './RankBadge';
import { useLeaderboard } from '../hooks/useLeaderboard';
import SuspenseLoader from '@/components/SuspenseLoader';

export interface LeaderboardProps {
    leagueId?: number | string;
}

const SkeletonRow: React.FC = () => (
    <tr className='animate-pulse'>
        <td className='py-4 px-4 flex justify-center items-center'>
            <div className='w-7 h-7 bg-border-color/60 rounded-full' />
        </td>
        <td className='py-4 px-4'>
            <div className='h-4 bg-border-color/60 rounded-sm w-32' />
        </td>
        <td className='py-4 px-4 text-right pr-6 flex justify-end items-center'>
            <div className='h-5 bg-border-color/60 rounded-full w-12' />
        </td>
    </tr>
);

const Leaderboard: React.FC<LeaderboardProps> = ({ leagueId = 'global' }) => {
    const { data: players = [], isLoading } = useLeaderboard(leagueId);

    if (isLoading) {
        return (
            <SuspenseLoader message="Loading leaderboard..." />
        )
    }

    return (
        <div className='flex flex-col gap-4 w-full h-full min-h-0'>
            {/* Leaderboard Table Container */}
            <div className='flex-1 min-h-0 overflow-y-auto rounded-lg border border-border-color bg-bg-card shadow-xs [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border-color/70 [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb:hover]:bg-text-muted'>
                <table className='w-full border-collapse text-left'>

                    <thead className='sticky top-0 bg-bg-card border-b border-border-color z-10'>
                        <tr className='text-[11px] font-bold text-text-muted uppercase tracking-wider bg-bg-main/50 backdrop-blur-md'>
                            <th className='py-3.5 px-4 w-16 text-center'>Rank</th>
                            <th className='py-3.5 px-4'>Player</th>
                            <th className='py-3.5 px-4 text-right pr-6'>CP</th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-border-color/50'>
                        {isLoading ? (
                            Array.from({ length: 8 }).map((_, index) => (
                                <SkeletonRow key={index} />
                            ))
                        ) : players.length === 0 ? (
                            <tr>
                                <td colSpan={3} className='text-center py-12 text-sm text-text-muted'>
                                    No players found.
                                </td>
                            </tr>
                        ) : (
                            players.map((player) => {

                                return (
                                    <tr
                                        key={player.position}
                                        className={`hover:bg-bg-card-hover/60 transition-colors duration-150 group cursor-pointer`}
                                    >
                                        <td className='py-3 px-4 flex justify-center items-center'>
                                            {renderRankBadge(player.position)}
                                        </td>
                                        <td className='py-3 px-4 text-sm font-semibold text-text-main group-hover:text-text-darker transition-colors duration-150'>
                                            <div className='flex items-center gap-2'>
                                                <span>{player.name}</span>
                                            </div>
                                        </td>
                                        <td className='py-3 px-4 text-right pr-6 text-sm font-bold text-primary'>
                                            <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary/5 text-primary border border-primary/10'>
                                                {player.cp}
                                            </span>
                                        </td>
                                    </tr>
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
