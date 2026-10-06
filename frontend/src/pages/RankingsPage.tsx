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
        <div className="relative flex min-h-0 w-full flex-1 flex-col rounded-lg border border-border-color bg-bg-card shadow-main min-[993px]:h-[min(800px,calc(100dvh-102px))] min-[993px]:flex-none animate-swipe-up">
            <div className="flex shrink-0 flex-col gap-6 border-b border-border-color p-8 max-[576px]:gap-4 max-[576px]:p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">

                        <h1 className="m-0 flex items-center gap-2 text-lg font-bold tracking-[-0.02em] text-text-main max-[576px]:text-xl">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            South Wales Rankings
                        </h1>
                    </div>

                </div>
                <p className="m-0 max-w-3xl text-sm leading-relaxed text-text-muted">
                    Track the region&apos;s strongest TCG players by
                    Championship Points. The top 20 qualify for the annual South
                    Wales World&apos;s event, held annually with a large cash
                    prize pool. Players earn CP by participating in official TCG
                    events. To register, message an admin on Discord to sign-up
                    for the event.
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <label
                            className="text-xs font-extrabold uppercase tracking-wider text-text-muted"
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
                            className="rounded-md border border-border-color bg-bg-card px-3 py-2 text-sm font-bold text-text-main shadow-xs outline-none transition-[border-color,box-shadow] duration-150 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                        >
                            {seasonOptions.map((season) => (
                                <option key={season} value={season}>
                                    {season}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <Leaderboard
                season={selectedSeason}
                players={isTop20Loading ? undefined : nationalPlayers}
                isLoading={isTop20Loading}
            />
        </div>
    );
};

export default RankingsPage;
