/* Hallmark — genre: modern-minimal — macrostructure: Workbench — design-system: design.md — designed-as-app */
import LeagueSelector from '@/features/league-selector';
import { useLeagues, useDocumentMetadata } from '@/hooks';
import { useCallback, useState } from 'react';
import { LeagueMap } from '@map';
import SuspenseLoader from '@/components/SuspenseLoader';

// TODO: #43 Properly implement this page using React Native. 

/**
 * LeaguesPage component displays a list of participating leagues/stores.
 * @returns {JSX.Element} The rendered LeaguesPage.
 */
const LeaguesPage: React.FC = () => {
    useDocumentMetadata({
        title: 'South Wales Pokemon League Map & Stores',
        description:
            'Find local TCG, VGC, and Pokemon GO leagues and stores across South Wales with our interactive venue map and store directory.',
    });

    const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(
        null
    );
    const { data: allLeagues = [], isLoading } = useLeagues();

    // Filter out championship series leagues (Regionals, Internationals, Worlds)
    // These appear on the schedule but not on the leagues map (Issue #29)
    const leagues = allLeagues.filter((league) => !league.isChampionshipSeries);

    const handleLeagueSelect = useCallback((id: number | null) => {
        setSelectedLeagueId(id);

        if (id !== null) {
            const cardElement = document.getElementById(`league-card-${id}`);
            if (cardElement) {
                cardElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }
        }
    }, []);

    if (isLoading) {
        return <SuspenseLoader message="Loading leagues map…" />;
    }

    return (
        <>
            <h1 className="sr-only">TCG and VGC Leagues in South Wales</h1>
            <div className="grid grid-cols-[minmax(340px,400px)_1fr] lg:h-[calc(100vh-140px)] h-[calc(100vh-200px)] overflow-hidden bg-bg-card border-2 border-border-color rounded-lg shadow-main animate-swipe-up max-[992px]:grid-cols-1 max-[992px]:grid-rows-[40vh_1fr] max-[576px]:grid-rows-[35vh_1fr] max-[576px]:rounded-md max-[576px]:border-2">
                <div className="flex flex-col p-4 h-full min-h-0 overflow-y-auto gap-3.5 border-r-2 border-border-color [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border-color/70 [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb:hover]:bg-text-muted max-[992px]:border-r-0 max-[992px]:border-t-2 max-[992px]:border-border-color max-[992px]:p-4 max-[576px]:p-3">
                    <LeagueSelector
                        leagues={leagues}
                        selectedLeagueId={selectedLeagueId}
                        setSelectedLeagueId={handleLeagueSelect}
                        columns={1}
                        showInfo={true}
                    />

                    {leagues.length === 0 ? (
                        <div className="text-center py-15 px-5 text-text-muted [&_p]:text-base [&_p]:font-medium">
                            <p>No leagues found.</p>
                        </div>
                    ) : null}
                </div>

                <div className="h-full min-h-0 p-0 relative bg-bg-main">
                    <LeagueMap
                        leagues={leagues}
                        selectedLeagueId={selectedLeagueId}
                        onLeagueSelect={handleLeagueSelect}
                    />
                </div>
            </div>
        </>
    );
};

export default LeaguesPage;
