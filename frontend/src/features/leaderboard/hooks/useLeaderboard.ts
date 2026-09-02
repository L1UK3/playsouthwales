import { useQuery } from '@tanstack/react-query';
import { loadTop20Players, loadLocalLeaderboard } from '@services/api';
import type { LeaderboardPosition } from '../types/LeaderboardPosition';

export function useLeaderboard(leagueId: string | number, season?: string) {
    return useQuery<LeaderboardPosition[]>({
        queryKey: ['leaderboard', leagueId, season],
        enabled: Boolean(leagueId),
        queryFn: async () => {
            if (leagueId === 'global') {
                try {
                    const globalData = await loadTop20Players(season);
                    if (
                        globalData?.players &&
                        Object.keys(globalData.players).length > 0
                    ) {
                        return Object.entries(globalData.players).map(
                            ([pos, player]: [string, any]) => ({
                                position: parseInt(pos, 10),
                                name: player.name ?? `Player ${pos}`,
                                cp:
                                    player.cp !== undefined
                                        ? player.cp
                                        : player.CP !== undefined
                                          ? player.CP
                                          : 0,
                                userId: player.userId,
                            })
                        );
                    }
                    return [];
                } catch (err) {
                    console.error('Failed to fetch global leaderboard:', err);
                    return [];
                }
            }

            try {
                const response = await loadLocalLeaderboard(Number(leagueId));
                if (response?.data && response.data.length > 0) {
                    return response.data.map((player: LeaderboardPosition) => ({
                        ...player,
                        name: player.name ?? `Player ${player.position ?? 1}`,
                    }));
                }
                return [];
            } catch (err) {
                console.error(
                    `Failed to fetch leaderboard for league ${leagueId}:`,
                    err
                );
                return [];
            }
        },
    });
}
