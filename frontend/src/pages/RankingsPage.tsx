import React from 'react';
import { Trophy } from 'lucide-react';
import SuspenseLoader from '@/components/SuspenseLoader';
import { useLeagues } from '@/hooks';
import Leaderboard from '@leaderboard/components/Leaderboard';
import LeagueSelector from '@/features/league-selector/components/LeagueSelector';

const RankingsPage: React.FC = () => {
    const [selectedLeagueId, setSelectedLeagueId] = React.useState<number | null>(null);
    const { data: leagues = [], isLoading } = useLeagues();

    const activeLeagueId = selectedLeagueId ?? leagues[0]?.leagueId ?? null;
    const selectedLeague = leagues.find(l => l.leagueId === activeLeagueId);

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
        <div className='grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] h-[calc(100vh-140px)] overflow-hidden bg-bg-card border-2 border-border-color rounded-lg shadow-main transition-all duration-300 animate-swipe-up max-[992px]:h-[calc(100vh-120px)] max-[992px]:grid-cols-1 max-[992px]:grid-rows-[1fr_1fr] max-[576px]:rounded-md max-[576px]:border-2'>

            {/* Left Column: Global Leaderboard */}
            <div className='flex flex-col p-4 h-full min-h-0 min-w-0 border-r-2 border-border-color max-[992px]:border-r-0 max-[992px]:border-b-2 max-[992px]:border-border-color max-[992px]:p-4 max-[576px]:p-3'>
                <div className='flex justify-between items-center pb-2 border-b border-border-color mb-3 flex-none'>
                    <h1 className='text-lg font-bold text-text-main flex items-center gap-2 m-0'>
                        <Trophy className='w-5 h-5 text-amber-500' />
                        Welsh Top 20
                    </h1>
                    <span className='text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20'>
                        National
                    </span>
                </div>
                <p className='text-sm text-text-muted mb-3 flex-none'>
                    The Welsh Top 20 shows the players with the highest CP (Championship Points) across Wales.
                    Those players with the most points are eligible to compete in the Welsh National Championship, which is held annually in the summer and boasts a prize pool of over £1,000.
                    Players earn CP by participating in official Pokémon TCG and VGC events, with more points awarded for higher placements.
                    In order to sign up to be included in the Welsh Top 20, contact us at <a href="mailto:playwales@proton.me" className='text-secondary hover:underline'>playwales@proton.me</a> or join the discord server and message an admin.
                </p>
                <h2 className='text-lg font-bold text-text-main mb-2 flex-none'>Season 2026-2027</h2>
                <div className='flex-1 min-h-0'>
                    <Leaderboard leagueId='global' />
                </div>
            </div>

            {/* Right Column: Local Leaderboards */}
            <div className='flex flex-col p-4 h-full min-h-0 min-w-0 gap-3 max-[992px]:p-4 max-[576px]:p-3 bg-bg-main/10'>
                <div className='flex flex-col gap-3 flex-none'>
                    <div className='flex justify-between items-center border-b border-border-color pb-2'>
                        <h2 className='text-lg font-bold text-text-main m-0'>Local Standings</h2>


                        {selectedLeague && (
                            <span
                                className='text-xs font-semibold px-2.5 py-0.5 rounded-full text-white transition-all duration-300 shadow-xs'
                                style={{ backgroundColor: selectedLeague.brandColor ?? 'var(--color-primary)' }}
                            >
                                {selectedLeague.location ?? 'Wales'}
                            </span>
                        )}
                    </div>

                    <p className='text-sm text-text-muted mb-3 flex-none'>
                        These are the local leaderboards for each league in Wales. Players can compete in their local league's weekly events in TCG for each major set release and for each regulation change in VGC to earn points and climb the standings.
                    </p>

                    <LeagueSelector
                        leagues={leagues}
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