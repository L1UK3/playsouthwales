/* Hallmark — genre: modern-minimal — macrostructure: Workbench — design-system: design.md — designed-as-app */
import React from 'react';
import { Trophy } from 'lucide-react';
import { useDocumentMetadata, useTop20Players } from '@/hooks';
import Leaderboard from '@leaderboard/components/Leaderboard';
import { LeaderboardCard } from '@leaderboard/components/ui/leaderboard-card';
import type { LeaderboardPosition } from '@/features/leaderboard/types/LeaderboardPosition';

function getTop20SeasonLabel(date = new Date()) {
    const seasonYear =
        date.getMonth() >= 6 ? date.getFullYear() + 1 : date.getFullYear();
    return String(seasonYear);
}

function getSeasonOptions() {
    return ['2027'];
}

const RankingsPage: React.FC = () => {
    useDocumentMetadata({
        title: 'South Wales Championship Rankings',
        description:
            'Track the South Wales Top 20 championship points leaderboard and local league rankings for TCG and VGC players.',
    });

    const [selectedSeason, setSelectedSeason] = React.useState(() =>
        getTop20SeasonLabel()
    );

    const { data: top20Data, isLoading: isTop20Loading } =
        useTop20Players(selectedSeason);

    const seasonOptions = React.useMemo(() => {
        if (
            top20Data?.availableSeasons &&
            top20Data.availableSeasons.length > 0
        ) {
            return top20Data.availableSeasons;
        }
        return getSeasonOptions();
    }, [top20Data]);

    const nationalPlayers = React.useMemo<LeaderboardPosition[]>(() => {
        if (!top20Data?.players) return [];
        return Object.entries(top20Data.players).map(([pos, player]) => ({
            position: parseInt(pos, 10),
            name: player.name,
            cp: player.cp ?? 0,
            userId: player.userId,
        }));
    }, [top20Data]);

    const nationalRankings = React.useMemo(
        () =>
            nationalPlayers.map((player, index) => ({
                userId: String(player.userId ?? `${player.name}-${index}`),
                userName: player.name,
                rank: index + 1,
                value: player.cp ?? 0,
            })),
        [nationalPlayers]
    );

    return (
        <div className="relative flex flex-col lg:h-[calc(100vh-140px)] h-[calc(100vh-200px)] overflow-hidden bg-bg-card border-2 border-border-color rounded-lg shadow-main animate-swipe-up max-[576px]:rounded-md max-[576px]:border-2">
            <div className="padding-6 flex flex-col max-h-[calc(100vh-200px)] overflow-hidden">
                <div className="flex justify-between items-center pb-2 border-b border-border-color mb-3 flex-none">
                    <h1 className="text-lg font-bold text-text-main flex items-center gap-2 m-0">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        South Wales Rankings
                    </h1>
                </div>
                <p className="text-xs text-text-muted mb-3 flex-none leading-relaxed">
                    The South Wales Top 20 shows the players with the highest CP
                    (Championship Points) across South Wales. Top players are
                    eligible to compete in the South Wales South Wales World's
                    event , held annually with a large cash prize pool. Players
                    earn CP by participating in official TCG and VGC events. To
                    register, message an admin on Discord to sign-up for the
                    event.
                </p>
                <div className="flex items-center gap-3 flex-wrap mb-2 flex-none">
                    <label
                        className="text-sm font-bold text-text-main"
                        htmlFor="top20-season-select"
                    >
                        Season
                    </label>
                    <select
                        id="top20-season-select"
                        value={selectedSeason}
                        onChange={(event) =>
                            setSelectedSeason(event.target.value)
                        }
                        className="border-2 border-border-color rounded-md bg-bg-card px-3 py-2 text-sm font-semibold text-text-main focus:outline-none focus:border-secondary"
                    >
                        {seasonOptions.map((season) => (
                            <option key={season} value={season}>
                                {season}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="flex-1 min-h-0 overflow-auto">
                {isTop20Loading ? (
                    <Leaderboard
                        leagueId="global"
                        season={selectedSeason}
                        players={nationalPlayers}
                        isLoading
                    />
                ) : (
                    <LeaderboardCard
                        title={`South Wales ${selectedSeason} Rankings`}
                        fromDate={`${Number(selectedSeason) - 1}-07-01`}
                        toDate={`${selectedSeason}-06-30`}
                        podiumRankings={nationalRankings}
                        rankings={nationalRankings}
                    />
                )}
            </div>
        </div>
    );
};

export default RankingsPage;
