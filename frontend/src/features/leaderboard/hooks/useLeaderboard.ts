import { useQuery } from '@tanstack/react-query';
import { loadTop20Players, loadLocalLeaderboard } from '@services/api';
import mockData from '../data/mock_data.json';
import type { LeaderboardPosition } from '../types/LeaderboardPosition';

export function useLeaderboard(leagueId: string | number, season?: string) {
    return useQuery<LeaderboardPosition[]>({
        queryKey: ['leaderboard', leagueId, season],
        queryFn: async () => {
            if (leagueId === 'global') {
                const globalData = await loadTop20Players(season);
                return Object.entries(globalData.players).map(([pos, player]: [string, any]) => ({
                    position: parseInt(pos, 10),
                    name: player.name,
                    cp: player.cp !== undefined ? player.cp : (player.CP !== undefined ? player.CP : 0),
                    userId: player.userId,
                }));
            }

            try {
                const response = await loadLocalLeaderboard(Number(leagueId));
                if (response?.data) {
                    return response.data;
                }
            } catch (err) {
                console.warn(`Failed to fetch leaderboard for league ${leagueId} from API, falling back to mock data:`, err);
            }

            const data = mockData as Record<string, LeaderboardPosition[]>;
            const leagueKey = leagueId.toString();
            return data[leagueKey] || [];
        },
    });
}
