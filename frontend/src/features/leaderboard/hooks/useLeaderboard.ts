import { useQuery } from '@tanstack/react-query';
import { loadTop20Players, loadLocalLeaderboard } from '@services/api';
import mockData from '../data/mock_data.json';
import type { LeaderboardPosition } from '../types/LeaderboardPosition';

export function useLeaderboard(leagueId: string | number, season?: string) {
    return useQuery<LeaderboardPosition[]>({
        queryKey: ['leaderboard', leagueId, season],
        queryFn: async () => {
            if (leagueId === 'global') {
                try {
                    const globalData = await loadTop20Players(season);
                    if (globalData && globalData.players && Object.keys(globalData.players).length > 0) {
                        return Object.entries(globalData.players).map(([pos, player]: [string, any]) => ({
                            position: parseInt(pos, 10),
                            name: player.name,
                            cp: player.cp !== undefined ? player.cp : (player.CP !== undefined ? player.CP : 0),
                            userId: player.userId,
                        }));
                    } else {
                        throw new Error("No players returned");
                    }
                } catch (err) {
                    console.warn("Failed to fetch global leaderboard, falling back to mock data:", err);
                    return [
                        { position: 1, name: "Dylan Hughes", cp: 120 },
                        { position: 2, name: "Connor Rees", cp: 110 },
                        { position: 3, name: "Megan Davies", cp: 95 },
                        { position: 4, name: "Ffion Jones", cp: 90 },
                        { position: 5, name: "Gavin Morgan", cp: 85 },
                        { position: 6, name: "Harri Owen", cp: 80 },
                        { position: 7, name: "Oliver Smith", cp: 75 },
                        { position: 8, name: "Amelia Taylor", cp: 70 },
                        { position: 9, name: "Liam Jenkins", cp: 65 },
                        { position: 10, name: "Chloe Davies", cp: 60 },
                        { position: 11, name: "Jack Davies", cp: 55 },
                        { position: 12, name: "Elin Roberts", cp: 50 },
                        { position: 13, name: "Lowri Roberts", cp: 45 },
                        { position: 14, name: "Rhys Vaughan", cp: 40 },
                        { position: 15, name: "Noah Roberts", cp: 35 },
                        { position: 16, name: "Grace Jones", cp: 30 },
                        { position: 17, name: "Evie Hughes", cp: 25 },
                        { position: 18, name: "Lucas Williams", cp: 20 },
                        { position: 19, name: "Freya Jones", cp: 15 },
                        { position: 20, name: "Sian Williams", cp: 10 },
                        { position: 21, name: "Sasha Gray", cp: 5 }
                    ];
                }
            }

            try {
                const response = await loadLocalLeaderboard(Number(leagueId));
                if (response?.data && response.data.length > 0) {
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
