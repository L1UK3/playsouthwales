import SuspenseLoader from "@/components/SuspenseLoader";
import LeagueSelector from "@/features/league-selector";
import { useLeagues } from "@/hooks/useLeagues";
import React from "react";

const PairingsPage: React.FC = () => {
    const [selectedLeagueId, setSelectedLeagueId] = React.useState<number | null>(null);
    const { data: leagues = [], isLoading } = useLeagues();

    const handleLeagueSelect = (id: number | null) => {
        setSelectedLeagueId(id);
        if (id !== null) {
            const cardElement = document.getElementById(`league-card-${id}`);
            if (cardElement) {
                cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    };

    if (isLoading) {
        return <SuspenseLoader message="Loading leagues..." />;
    }

    return (
        <div className="grid grid-cols-[minmax(360px,420px)_1fr] h-[calc(100vh-180px)] overflow-hidden bg-bg-card border-4 border-border-color rounded-lg shadow-main transition-all duration-300 animate-swipe-up max-[992px]:grid-cols-1 max-[992px]:grid-rows-[40vh_1fr] max-[576px]:grid-rows-[35vh_1fr] max-[576px]:rounded-md max-[576px]:border-2">

            <div className="flex flex-col p-6 h-full min-h-0 overflow-y-auto gap-5 border-r-2 border-border-color [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border-color/70 [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb:hover]:bg-text-muted max-[992px]:border-r-0 max-[992px]:border-t-2 max-[992px]:border-border-color max-[992px]:p-5 max-[576px]:p-4">

                <LeagueSelector
                    leagues={leagues}
                    selectedLeagueId={selectedLeagueId}
                    setSelectedLeagueId={handleLeagueSelect}
                    columns={1}
                />


                {leagues.length === 0 ? (
                    <div className="text-center py-15 px-5 text-text-muted [&_p]:text-base [&_p]:font-medium">
                        <p>No leagues found.</p>
                    </div>
                ) : null}
            </div>

            <div className="h-full min-h-0 p-0 relative bg-bg-main">
                {selectedLeagueId === null && (
                    <p className="text-center py-15 px-5 text-text-muted [&_p]:text-base [&_p]:font-medium">
                        Select a league to view live pairings and tournament progress.
                    </p>
                )}
                {selectedLeagueId !== null && (
                <div className="text-center py-15 px-5 text-text-muted [&_p]:text-base [&_p]:font-medium animate-swipe-up">
                    No pairings found
                </div>
                )}
            </div>
        </div>
    );
}

export default PairingsPage;