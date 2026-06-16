import { useQuery } from '@tanstack/react-query';
import { loadTop20Players } from '@services/api';
import mockData from '../data/mock_data.json';
import type { LeaderboardPosition } from '../types/LeaderboardPosition';

export function useLeaderboard(leagueId: string | number) {
    return useQuery<LeaderboardPosition[]>({
        queryKey: ['leaderboard', leagueId],
        queryFn: async () => {
            if (leagueId === 'global') {
                const globalData = await loadTop20Players();
                return globalData.map((player: any) => ({
                    position: player.position,
                    name: player.name,
                    cp: player.cp !== undefined ? player.cp : (player.CP !== undefined ? player.CP : 0),
                    userId: player.userId,
                }));
            }

            const data = mockData as Record<string, LeaderboardPosition[]>;
            const leagueKey = leagueId.toString();
            return data[leagueKey] || [];
        },
    });
}
