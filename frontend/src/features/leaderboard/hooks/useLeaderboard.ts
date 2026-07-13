import { useQuery } from '@tanstack/react-query';
import { loadTop20Players, loadLocalLeaderboard } from '@services/api';
import mockData from '../data/mock_data.json';
import type { LeaderboardPosition } from '../types/LeaderboardPosition';

const mockNames = [
    'Dylan Hughes',
    'Connor Rees',
    'Megan Davies',
    'Ffion Jones',
    'Gavin Morgan',
    'Harri Owen',
    'Oliver Smith',
    'Amelia Taylor',
    'Liam Jenkins',
    'Chloe Davies',
    'Jack Davies',
    'Elin Roberts',
    'Lowri Roberts',
    'Rhys Vaughan',
    'Noah Roberts',
    'Grace Jones',
    'Evie Hughes',
    'Lucas Williams',
    'Freya Jones',
    'Sian Williams',
    'Sasha Gray',
];

export function useLeaderboard(leagueId: string | number, season?: string) {
    return useQuery<LeaderboardPosition[]>({
        queryKey: ['leaderboard', leagueId, season],
        queryFn: async () => {
            if (leagueId === 'global') {
                try {
                    const globalData = await loadTop20Players(season);
                    if (
                        globalData?.players &&
                        Object.keys(globalData.players).length > 0
                    ) {
                        return Object.entries(globalData.players).map(
                            ([pos, player]: [string, any]) => {
                                const index = parseInt(pos, 10) - 1;
                                const fallbackName =
                                    mockNames[index] ?? 'Player ' + pos;
                                return {
                                    position: parseInt(pos, 10),
                                    name: player.name ?? fallbackName,
                                    cp:
                                        player.cp !== undefined
                                            ? player.cp
                                            : player.CP !== undefined
                                              ? player.CP
                                              : 0,
                                    userId: player.userId,
                                };
                            }
                        );
                    } else {
                        throw new Error('No players returned');
                    }
                } catch (err) {
                    console.warn(
                        'Failed to fetch global leaderboard, falling back to mock data:',
                        err
                    );
                    return mockNames.map((name, index) => ({
                        position: index + 1,
                        name: name,
                        cp: 120 - index * 5,
                        userId: 'mock-' + index,
                    }));
                }
            }

            try {
                const response = await loadLocalLeaderboard(Number(leagueId));
                if (response?.data && response.data.length > 0) {
                    return response.data.map((player: any) => {
                        const index =
                            (player.position
                                ? parseInt(player.position, 10)
                                : 1) - 1;
                        const fallbackName =
                            mockNames[index] ??
                            'Player ' + (player.position ?? 1);
                        return {
                            ...player,
                            name: player.name ?? fallbackName,
                        };
                    });
                }
            } catch (err) {
                console.warn(
                    'Failed to fetch leaderboard for league ' +
                        leagueId +
                        ' from API, falling back to mock data:',
                    err
                );
            }

            const data = mockData as Record<string, LeaderboardPosition[]>;
            const rawMock = data['1'] || [];
            return rawMock.map((player: any) => {
                const index =
                    (player.position ? parseInt(player.position, 10) : 1) - 1;
                const fallbackName =
                    mockNames[index] ?? 'Player ' + (player.position ?? 1);
                return {
                    ...player,
                    name: player.name ?? fallbackName,
                };
            });
        },
    });
}
