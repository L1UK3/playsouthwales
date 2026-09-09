import React from 'react';
import { RankBadge } from './RankBadge';
import { useLeaderboard } from '../hooks/useLeaderboard';
import type { LeaderboardPosition } from '../types/LeaderboardPosition';
import { SkeletonRow } from './SkeletonRow';

export const GLOBAL_LEAGUE_ID = 'global';
export const TOP_CUTOFF_THRESHOLD = 20;
export const TOP_CUTOFF_POSITION = TOP_CUTOFF_THRESHOLD + 1;
const SKELETON_ROW_COUNT = 8;
const EMPTY_PLAYERS: LeaderboardPosition[] = [];

export type LeaderboardMode = 'national' | 'local';

const COLUMN_COUNT: Record<LeaderboardMode, number> = {
    national: 3,
    local: 7,
};

const PODIUM_STYLES: Record<number, string> = {
    1: 'border-l-4 border-t-1 border-amber-400 bg-amber-400/5',
    2: 'border-l-4 border-slate-400 bg-slate-400/5',
    3: 'border-l-4 border-amber-700 bg-amber-700/5',
};

export interface LeaderboardProps {
    leagueId?: number | string;
    season?: string;
    players?: LeaderboardPosition[];
    isLoading?: boolean;
}

const LeaderboardHeader: React.FC<{ mode: LeaderboardMode }> = ({ mode }) => {
    if (mode === 'national') {
        return (
            <th className="py-2 px-3 text-right pr-4">Championship Points</th>
        );
    }

    return (
        <>
            <th className="py-2 px-3 text-center w-12 hidden md:table-cell">
                W
            </th>
            <th className="py-2 px-3 text-center w-12 hidden md:table-cell">
                L
            </th>
            <th className="py-2 px-3 text-center w-12 hidden md:table-cell">
                D
            </th>
            <th className="py-2 px-3 text-center w-24 hidden sm:table-cell">
                Attendance
            </th>
            <th className="py-2 px-3 text-right pr-4 w-20">Points</th>
        </>
    );
};

const LeaderboardMetrics: React.FC<{
    player: LeaderboardPosition;
    mode: LeaderboardMode;
}> = ({ player, mode }) => {
    if (mode === 'national') {
        return (
            <td className="py-1.5 px-3 text-right pr-4 text-sm font-bold text-primary">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary/5 text-primary border border-primary/10">
                    {player.cp}
                </span>
            </td>
        );
    }

    return (
        <>
            <td className="py-1.5 px-3 text-center text-sm font-medium text-text-main hidden md:table-cell">
                {player.wins ?? 0}
            </td>
            <td className="py-1.5 px-3 text-center text-sm font-medium text-text-main hidden md:table-cell">
                {player.losses ?? 0}
            </td>
            <td className="py-1.5 px-3 text-center text-sm font-medium text-text-main hidden md:table-cell">
                {player.draws ?? 0}
            </td>
            <td className="py-1.5 px-3 text-center text-sm font-medium text-text-main hidden sm:table-cell">
                {player.attendance ?? 0}
            </td>
            <td className="py-1.5 px-3 text-right pr-4 text-sm font-bold text-primary">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary/5 text-primary border border-primary/10">
                    {player.points}
                </span>
            </td>
        </>
    );
};

const Leaderboard: React.FC<LeaderboardProps> = ({
    leagueId = GLOBAL_LEAGUE_ID,
    season,
    players: propPlayers,
    isLoading: propIsLoading,
}) => {
    const mode: LeaderboardMode =
        leagueId === GLOBAL_LEAGUE_ID ? 'national' : 'local';
    const isGlobal = mode === 'national';

    const { data: fetchedPlayers = EMPTY_PLAYERS, isLoading: queryIsLoading } =
        useLeaderboard(propPlayers !== undefined ? '' : leagueId, season);

    const rawPlayers = propPlayers ?? fetchedPlayers;

    const sortedPlayers: LeaderboardPosition[] = React.useMemo(() => {
        return [...rawPlayers].sort((a, b) => {
            if (mode === 'national') {
                const cpDiff = (b.cp ?? 0) - (a.cp ?? 0);
                if (cpDiff !== 0) return cpDiff;
                return a.name.localeCompare(b.name);
            }
            const pointsDiff = (b.points ?? 0) - (a.points ?? 0);
            if (pointsDiff !== 0) return pointsDiff;
            return a.name.localeCompare(b.name);
        });
    }, [rawPlayers, mode]);

    const isLoading = propIsLoading ?? queryIsLoading;

    return (
        <div className="flex flex-col gap-4 w-full h-full min-h-0">
            {/* Leaderboard Table Container */}
            <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-border-color bg-bg-card shadow-xs">
                <table className="w-full border-collapse text-left">
                    <thead className="sticky top-0 bg-bg-card border-b border-border-color z-10">
                        <tr className="text-[11px] font-bold text-text-muted uppercase tracking-wider bg-bg-main/50 backdrop-blur-md">
                            <th className="py-2 px-3 w-16 text-center">Rank</th>
                            <th className="py-2 px-3">Player</th>
                            <LeaderboardHeader mode={mode} />
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-border-color/50">
                        {isLoading ? (
                            Array.from(
                                { length: SKELETON_ROW_COUNT },
                                (_, index) => (
                                    <SkeletonRow
                                        key={index}
                                        isGlobal={isGlobal}
                                    />
                                )
                            )
                        ) : sortedPlayers.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={COLUMN_COUNT[mode]}
                                    className="text-center py-12 text-sm text-text-muted"
                                >
                                    No players found.
                                </td>
                            </tr>
                        ) : (
                            sortedPlayers.map((player, index) => {
                                const rank = index + 1;
                                const renderCutoff =
                                    mode === 'national' &&
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
                                                    colSpan={COLUMN_COUNT[mode]}
                                                    className="py-2 px-3 text-center text-xs font-bold text-text-muted border-t border-b border-border-color border-dashed uppercase tracking-wider select-none"
                                                >
                                                    Top 20 Cutoff
                                                </td>
                                            </tr>
                                        ) : null}
                                        <tr
                                            className={`hover:bg-bg-card-hover/60 transition-[background-color] duration-150 group cursor-pointer ${
                                                mode === 'national' &&
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
                                                mode={mode}
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
