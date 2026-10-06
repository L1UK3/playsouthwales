import React from 'react';
import { RankBadge } from './RankBadge';
import {
    LeaderboardPodium,
    type LeaderboardRanking as LeaderboardPodiumRanking,
} from './leaderboard-podium';
import { useLeaderboard } from '../hooks/useLeaderboard';
import type { LeaderboardPosition } from '../types/LeaderboardPosition';
import { SkeletonRow } from './SkeletonRow';

export const TOP_CUTOFF_THRESHOLD = 20;
export const TOP_CUTOFF_POSITION = TOP_CUTOFF_THRESHOLD + 1;
const SKELETON_ROW_COUNT = 8;
const EMPTY_PLAYERS: LeaderboardPosition[] = [];

const COLUMN_COUNT = 3;

const PODIUM_STYLES: Record<number, string> = {
    1: 'border-l-4 border-t-1 border-amber-400 bg-amber-400/5',
    2: 'border-l-4 border-slate-400 bg-slate-400/5',
    3: 'border-l-4 border-amber-700 bg-amber-700/5',
};

export interface LeaderboardProps {
    season?: string;
    players?: LeaderboardPosition[];
    isLoading?: boolean;
}

const LeaderboardHeader = () => (
    <th className="py-2 px-3 text-right pr-4">Championship Points</th>
);

const LeaderboardMetrics: React.FC<{ player: LeaderboardPosition }> = ({
    player,
}) => (
    <td className="py-1.5 px-3 text-right pr-4 text-sm font-bold">
        {player.cp ?? 0}
    </td>
);

const Leaderboard: React.FC<LeaderboardProps> = ({
    season,
    players: propPlayers,
    isLoading: propIsLoading,
}) => {
    const { data: fetchedPlayers = EMPTY_PLAYERS, isLoading: queryIsLoading } =
        useLeaderboard(season, propPlayers !== undefined);

    const rawPlayers = propPlayers ?? fetchedPlayers;

    const sortedPlayers: LeaderboardPosition[] = React.useMemo(() => {
        return [...rawPlayers].sort((a, b) => {
            const cpDiff = (b.cp ?? 0) - (a.cp ?? 0);
            if (cpDiff !== 0) return cpDiff;
            return a.name.localeCompare(b.name);
        });
    }, [rawPlayers]);

    const isLoading = propIsLoading ?? queryIsLoading;
    const podiumRankings = React.useMemo<LeaderboardPodiumRanking[]>(
        () =>
            sortedPlayers.slice(0, 3).map((player, index) => ({
                userId: String(player.userId ?? `${player.name}-${index}`),
                userName: player.name,
                rank: index + 1,
                value: player.cp ?? 0,
            })),
        [sortedPlayers]
    );

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
            {!isLoading && podiumRankings.length > 0 ? (
                <LeaderboardPodium
                    rankings={podiumRankings}
                    className="shrink-0 border-b border-border-color pb-4"
                    showAvatar={false}
                    medalStyle="modern"
                />
            ) : null}

            <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-border-color bg-bg-card shadow-xs">
                <table className="w-full border-collapse text-left">
                    <thead className="sticky top-0 bg-bg-card border-b border-border-color z-10">
                        <tr className="text-[11px] font-bold text-text-muted uppercase tracking-wider bg-bg-main/50 backdrop-blur-md">
                            <th className="py-2 px-3 w-16 text-center">Rank</th>
                            <th className="py-2 px-3">Player</th>
                            <LeaderboardHeader />
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-border-color/50">
                        {isLoading ? (
                            Array.from(
                                { length: SKELETON_ROW_COUNT },
                                (_, index) => (
                                    <SkeletonRow key={index} isGlobal />
                                )
                            )
                        ) : sortedPlayers.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={COLUMN_COUNT}
                                    className="text-center py-12 text-sm text-text-muted"
                                >
                                    No players found.
                                </td>
                            </tr>
                        ) : (
                            sortedPlayers.map((player, index) => {
                                const rank = index + 1;
                                const renderCutoff =
                                    rank === TOP_CUTOFF_POSITION;

                                return (
                                    <React.Fragment
                                        key={
                                            player.userId ??
                                            `${rank}-${player.name}`
                                        }
                                    >
                                        {renderCutoff ? (
                                            <tr className="bg-bg-main/30">
                                                <td
                                                    colSpan={COLUMN_COUNT}
                                                    className="py-2 px-3 text-center text-xs font-bold text-text-muted border-t border-b border-border-color border-dashed uppercase tracking-wider select-none"
                                                >
                                                    Top 20 Cutoff
                                                </td>
                                            </tr>
                                        ) : null}
                                        <tr
                                            className={`hover:bg-bg-card-hover/60 transition-[background-color] duration-150 group cursor-pointer ${
                                                PODIUM_STYLES[rank]
                                                    ? PODIUM_STYLES[rank]
                                                    : ''
                                            }`}
                                        >
                                            <td className="py-1.5 px-3 flex justify-center items-center">
                                                <RankBadge position={rank} />
                                            </td>
                                            <td className="py-1.5 px-3 text-sm font-semibold text-text-main group-hover:text-text-darker transition-[color] duration-150">
                                                <div className="flex items-center gap-2">
                                                    <span>{player.name}</span>
                                                </div>
                                            </td>
                                            <LeaderboardMetrics
                                                player={player}
                                            />
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
