/* Hallmark — genre: modern-minimal — macrostructure: Workbench — design-system: design.md — designed-as-app */
import LeagueSelector from '@/features/league-selector';
import { useLeagues, useDocumentMetadata, useMediaQuery } from '@/hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { List } from 'lucide-react';
import { LeagueMap } from '@map';
import LeagueSheet from '@map/components/LeagueSheet';
import MapSheet from '@map/components/MapSheet';
import { createLeagueMap } from '@calendar/utils/dataProcessing';
import { MOBILE_MAP_QUERY } from '@/constants';
import SuspenseLoader from '@/components/SuspenseLoader';

/**
 * Share of the map's height to show a selected league above the centre on
 * mobile. It places the marker in the visible area above the league sheet.
 */
const SHEET_FOCUS_SHARE = 0.3;

/**
 * LeaguesPage component displays a list of participating leagues/stores.
 * On desktop it shows the list beside the map. On mobile the map fills the
 * screen, and a bottom sheet shows the selected league and its next events.
 * @returns {JSX.Element} The rendered LeaguesPage.
 */
const LeaguesPage: React.FC = () => {
    useDocumentMetadata({
        title: 'South Wales League Map & Stores',
        description:
            'Find local TCG, VGC, and GO leagues and stores across South Wales with our interactive venue map and store directory.',
    });

    const isMobile = useMediaQuery(MOBILE_MAP_QUERY);
    const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(
        null
    );
    const [isListOpen, setIsListOpen] = useState(false);
    const [mapHeight, setMapHeight] = useState(0);
    const mapAreaRef = useRef<HTMLDivElement>(null);
    const { data: allLeagues = [], isLoading } = useLeagues();

    // Filter out championship series leagues (Regionals, Internationals, Worlds)
    // These appear on the schedule but not on the leagues map (Issue #29)
    const leagues = useMemo(
        () => allLeagues.filter((league) => !league.isChampionshipSeries),
        [allLeagues]
    );
    const leagueMap = useMemo(() => createLeagueMap(leagues), [leagues]);
    const selectedLeague =
        leagues.find((league) => league.leagueId === selectedLeagueId) ?? null;

    // Track the mobile map's height, so the focus offset fits any screen.
    useEffect(() => {
        const mapArea = mapAreaRef.current;
        if (!isMobile || !mapArea) return;

        const observer = new ResizeObserver(([entry]) => {
            setMapHeight(entry.contentRect.height);
        });
        observer.observe(mapArea);
        return () => observer.disconnect();
    }, [isMobile, isLoading]);

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

    const handleSelectFromList = useCallback((id: number | null) => {
        setIsListOpen(false);
        setSelectedLeagueId(id);
    }, []);

    const handleCloseLeagueSheet = useCallback(() => {
        setSelectedLeagueId(null);
    }, []);

    const handleCloseList = useCallback(() => {
        setIsListOpen(false);
    }, []);

    if (isLoading) {
        return <SuspenseLoader message="Loading leagues map…" />;
    }

    if (isMobile) {
        return (
            <div
                ref={mapAreaRef}
                className="relative -mx-4 -mt-4 -mb-4 h-[calc(100dvh-8.75rem)] min-h-90 overflow-hidden bg-bg-main"
            >
                <LeagueMap
                    leagues={leagues}
                    selectedLeagueId={selectedLeagueId}
                    onLeagueSelect={handleLeagueSelect}
                    showInfoWindow={false}
                    focusOffsetY={Math.round(mapHeight * SHEET_FOCUS_SHARE)}
                />

                <button
                    type="button"
                    onClick={() => setIsListOpen(true)}
                    aria-expanded={isListOpen}
                    className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 py-2 px-3.5 rounded-full border border-border-color bg-bg-card text-text-main text-sm font-bold shadow-main cursor-pointer transition-colors duration-150 hover:bg-bg-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                >
                    <List aria-hidden="true" className="size-4" />
                    Leagues
                    <span className="text-text-muted font-semibold">
                        {leagues.length}
                    </span>
                </button>

                {isListOpen ? (
                    <MapSheet title="Leagues" onClose={handleCloseList}>
                        {leagues.length === 0 ? (
                            <p className="m-0 py-6 text-center text-sm font-medium text-text-muted">
                                No leagues found.
                            </p>
                        ) : (
                            <LeagueSelector
                                leagues={leagues}
                                selectedLeagueId={selectedLeagueId}
                                setSelectedLeagueId={handleSelectFromList}
                                columns={1}
                                showInfo={false}
                            />
                        )}
                    </MapSheet>
                ) : (
                    selectedLeague && (
                        <LeagueSheet
                            key={selectedLeague.leagueId}
                            league={selectedLeague}
                            leagueMap={leagueMap}
                            onClose={handleCloseLeagueSheet}
                        />
                    )
                )}
            </div>
        );
    }

    return (
        <>
            <div className="grid h-[calc(100dvh-8rem)] min-h-150 grid-cols-[minmax(340px,400px)_1fr] overflow-hidden rounded-md border border-border-color bg-bg-card animate-swipe-up">
                <div className="flex flex-col p-4 h-full min-h-0 overflow-y-auto gap-3.5 border-r-2 border-border-color animate-swipe-up delay-75">
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
