import React from 'react';
import { Trophy } from 'lucide-react';
import SuspenseLoader from '@/components/SuspenseLoader';
import { useLeagues, useDocumentMetadata } from '@/hooks';
import Leaderboard from '@leaderboard/components/Leaderboard';
import LeagueSelector from '@/features/league-selector/components/LeagueSelector';
import ComingSoon from '@/components/ComingSoon';

function getTop20SeasonLabel(date = new Date()) {
    const startYear = date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;
    return `${startYear}-${startYear + 1}`;
}

function getSeasonOptions() {
    const currentSeason = getTop20SeasonLabel();
    const [startYear] = currentSeason.split('-').map(Number);

    return [
        `${startYear - 1}-${startYear}`,
        currentSeason,
    ];
}


const RankingsPage: React.FC = () => {
    useDocumentMetadata({
        title: 'South Wales Pokemon Championship Rankings',
        description: 'Track the South Wales Pokemon Top 20 championship points leaderboard and local league rankings for TCG and VGC players.'
    });

    const [selectedLeagueId, setSelectedLeagueId] = React.useState<number | null>(null);
    const [selectedSeason, setSelectedSeason] = React.useState(() => getTop20SeasonLabel());
    const [rankingsTab, setRankingsTab] = React.useState<'national' | 'local'>('national');
    const { data: leagues = [], isLoading } = useLeagues();
    const seasonOptions = React.useMemo(() => getSeasonOptions(), []);

    const handleTabChange = (tab: 'national' | 'local') => {
        if (document.startViewTransition) {
            document.startViewTransition(() => setRankingsTab(tab));
        } else {
            setRankingsTab(tab);
        }
    };

    const leaguesWithStandings = React.useMemo(() => {
        return leagues.filter((league) => {
            if (!league.hasStandings) {
                return false;
            }

            if (typeof league.hasStandings !== 'object') {
                return false;
            }

            const leagueStandings = (league.hasStandings as Record<string, unknown[]>)[selectedSeason];
            return leagueStandings && leagueStandings.length > 0;
        });
    }, [leagues, selectedSeason]);

    const activeLeagueId = selectedLeagueId ?? leaguesWithStandings[0]?.leagueId ?? null;

    const handleLeagueSelect = (id: number | null) => {
        setSelectedLeagueId(id);
        if (id !== null) {
            const cardElement = document.getElementById(`league-card-${id}`);
            if (cardElement) {
                cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            }
        }
    };

    if (isLoading) {
        return <SuspenseLoader message='Loading rankings...' />;
    }

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:h-[calc(100vh-140px)] h-[calc(100vh-200px)] overflow-hidden bg-bg-card border-2 border-border-color rounded-lg shadow-main transition-all duration-300 animate-swipe-up max-[576px]:rounded-md max-[576px]:border-2">

            <ComingSoon message="The South Wales Top 20 and local league standings are currently under development. Check back soon for updates!" />
            {/* Mobile Tab Toggle for Rankings */}
            <div className="flex border-b border-border-color bg-bg-card p-1 lg:hidden shrink-0">
                <button
                    type="button"
                    className={`flex-1 py-2 text-center text-sm font-bold rounded-md transition-colors border-none cursor-pointer ${rankingsTab === 'national' ? 'bg-primary text-white!' : 'bg-transparent text-text-muted hover:bg-bg-card-hover'}`}
                    onClick={() => handleTabChange('national')}
                >
                    National Standings
                </button>
                <button
                    type="button"
                    className={`flex-1 py-2 text-center text-sm font-bold rounded-md transition-colors border-none cursor-pointer ${rankingsTab === 'local' ? 'bg-primary text-white!' : 'bg-transparent text-text-muted hover:bg-bg-card-hover'}`}
                    onClick={() => handleTabChange('local')}
                >
                    Local Standings
                </button>
            </div>

            {/* Left Column: Global Leaderboard */}
            <div className={`flex-col p-4 h-full min-h-0 min-w-0 border-r-2 border-border-color max-[992px]:border-r-0 max-[992px]:p-4 max-[576px]:p-3 ${rankingsTab === 'national' ? 'flex' : 'hidden lg:flex'}`}>
                <div className='flex justify-between items-center pb-2 border-b border-border-color mb-3 flex-none'>
                    <h1 className='text-lg font-bold text-text-main flex items-center gap-2 m-0'>
                        <Trophy className='w-5 h-5 text-amber-500' />
                        South Wales Top 20
                    </h1>
                    <span className='text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20'>
                        National
                    </span>
                </div>
                <p className='text-xs text-text-muted mb-3 flex-none leading-relaxed'>
                    The South Wales Top 20 shows the players with the highest CP (Championship Points) across South Wales.
                    Top players are eligible to compete in the South Wales National Championship, held annually.
                    Players earn CP by participating in official TCG and VGC events.
                    To register, contact <a href="mailto:playwales@proton.me" className='text-secondary hover:underline'>playwales@proton.me</a> or message an admin on Discord.
                </p>
                <div className='flex items-center gap-3 flex-wrap mb-2 flex-none'>
                    <label className='text-sm font-bold text-text-main' htmlFor='top20-season-select'>
                        Season
                    </label>
                    <select
                        id='top20-season-select'
                        value={selectedSeason}
                        onChange={(event) => setSelectedSeason(event.target.value)}
                        className='border-2 border-border-color rounded-md bg-bg-card px-3 py-2 text-sm font-semibold text-text-main focus:outline-none focus:border-secondary'
                    >
                        {seasonOptions.map((season) => (
                            <option key={season} value={season}>
                                {season}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='flex-1 min-h-0'>
                    <Leaderboard leagueId='global' season={selectedSeason} />
                </div>
            </div>

            {/* Right Column: Local Leaderboards */}
            <div className={`flex-col p-4 h-full min-h-0 min-w-0 gap-3 max-[992px]:p-4 max-[576px]:p-3 bg-bg-main/10 ${rankingsTab === 'local' ? 'flex' : 'hidden lg:flex'}`}>
                <div className='flex flex-col gap-3 flex-none'>
                    <div className='flex justify-between items-center border-b border-border-color pb-2'>
                        <h2 className='text-lg font-bold text-text-main m-0'>Local Standings</h2>
                    </div>

                    <p className='text-xs text-text-muted mb-3 flex-none leading-relaxed'>
                        These are the local standings for each league in South Wales. Standings reset with each new standard format rotation. Participate in weekly events to earn points and climb the ladder.
                    </p>

                    <LeagueSelector
                        leagues={leaguesWithStandings}
                        selectedLeagueId={activeLeagueId}
                        setSelectedLeagueId={handleLeagueSelect}
                        showInfo={false}
                        layout="scroll"
                    />
                </div>

                {/* Local Leaderboard Content */}
                <div className='flex-1 min-h-0'>
                    {activeLeagueId !== null ? (
                        <Leaderboard leagueId={activeLeagueId} />
                    ) : (
                        <div className='flex flex-col items-center justify-center h-full text-center py-12 px-4 text-text-muted border-2 border-dashed border-border-color rounded-lg bg-bg-card/50'>
                            <p className='text-sm font-medium m-0'>Select a league from above to view standings.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default RankingsPage;