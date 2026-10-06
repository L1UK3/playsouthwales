/* Hallmark — genre: modern-minimal — macrostructure: Workbench — design-system: design.md — designed-as-app */
import React from 'react';
import { Trophy } from 'lucide-react';
import { useDocumentMetadata, useTop20Players } from '@/hooks';
import Leaderboard from '@leaderboard/components/Leaderboard';
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
            'View the South Wales National Rankings by official Championship Points for TCG and VGC players.',
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

    return (
        <div className="relative flex min-h-0 flex-1 flex-col rounded-md border border-border-color bg-bg-card">
            <div className="flex shrink-0 flex-col p-6 max-[576px]:p-4">
                <div className="mb-4 flex items-center justify-between gap-4 border-b border-border-color pb-3">
                    <h1 className="m-0 flex items-center gap-2 text-lg font-bold text-text-main">
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
                <div className="mb-0 flex flex-wrap items-center gap-3">
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
                        className="rounded-md border border-border-color bg-bg-card px-3 py-2 text-sm font-semibold text-text-main focus:border-secondary focus:outline-none"
                    >
                        {seasonOptions.map((season) => (
                            <option key={season} value={season}>
                                {season}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
                <Leaderboard
                    season={selectedSeason}
                    players={isTop20Loading ? undefined : nationalPlayers}
                    isLoading={isTop20Loading}
                />
            </div>
        </div>
    );
};

export default RankingsPage;
