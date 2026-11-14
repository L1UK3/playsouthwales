import { useQuery } from '@tanstack/react-query';
import { loadTop20Players } from '@services/api';
import type { LeaderboardPosition } from '../types/LeaderboardPosition';

export function useLeaderboard(season?: string, skip = false) {
    return useQuery<LeaderboardPosition[]>({
        queryKey: ['leaderboard', 'global', season],
        enabled: !skip,
        queryFn: async () => {
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
        },
    });
}
