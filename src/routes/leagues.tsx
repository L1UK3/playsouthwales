import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { List } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import LeagueSelector from "#/features/league-selector/components/LeagueSelector";
import { getLeagues } from "#/features/leagues/leagues.functions";
import LeagueMap from "#/features/map/components/LeagueMap";
import LeagueSheet from "#/features/map/components/LeagueSheet";
import MapSheet from "#/features/map/components/MapSheet";
import useIsMobileMap from "#/features/map/hooks/useIsMobileMap";
import { createLeagueMap } from "#/lib/events";
import { optionalId } from "#/lib/search";
import { pageMeta } from "#/lib/seo";
import { cn } from "#/lib/utils";

/**
 * Share of the map's height to show a selected league above the centre on
 * mobile. It places the marker in the visible area above the league sheet.
 */
const SHEET_FOCUS_SHARE = 0.3;

export const Route = createFileRoute("/leagues")({
	validateSearch: (search): { league?: number } => ({
		league: optionalId(search.league),
	}),
	loader: () => getLeagues(),
	head: () =>
		pageMeta("South Wales League Map & Stores", {
			description:
				"Find local TCG, VGC and GO leagues and stores across South Wales.",
		}),
	component: LeaguesPage,
});

/**
 * On desktop the league list sits beside the map, and a marker opens an info
 * box. Below `lg` the map fills the screen: a marker opens a bottom sheet with
 * the league's details and next events, and a button opens the list as a sheet.
 */
function LeaguesPage() {
	const allLeagues = Route.useLoaderData();
	const { league: selectedLeagueId } = Route.useSearch();
	const navigate = Route.useNavigate();
	const isMobile = useIsMobileMap();
	const [isListOpen, setIsListOpen] = useState(false);
	const [mapHeight, setMapHeight] = useState(0);
	const mapAreaRef = useRef<HTMLDivElement>(null);

	const leagues = useMemo(
		() => allLeagues.filter((league) => !league.isChampionshipSeries),
		[allLeagues],
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
	}, [isMobile]);

	const selectLeague = (id: number | null) => {
		navigate({
			search: (prev) => ({ ...prev, league: id ?? undefined }),
			replace: true,
		});
		if (id !== null) {
			document
				.getElementById(`league-card-${id}`)
				?.scrollIntoView({ behavior: "smooth", block: "nearest" });
		}
	};

	const selectFromList = (id: number | null) => {
		setIsListOpen(false);
		selectLeague(id);
	};

	const emptyMessage = (
		<p className="px-5 py-15 text-center text-base font-medium text-text-muted">
			No leagues found.
		</p>
	);

	return (
		<div
			className={cn(
				// Below lg the page cancels main's padding and grows into the space the
				// header and nav bar leave, whatever height the header has.
				"-mx-4 -mt-4 -mb-4 flex min-h-90 flex-1 flex-col animate-swipe-up",
				"overflow-hidden bg-bg-card",
				"lg:m-0 lg:grid lg:h-[calc(100dvh-8rem)] lg:min-h-150 lg:flex-none",
				"lg:grid-cols-[minmax(340px,400px)_1fr] lg:rounded-md lg:border",
				"lg:border-border-color",
			)}
		>
			<div
				className={cn(
					"hidden min-h-0 flex-col gap-3.5 overflow-y-auto p-4 delay-75",
					"animate-swipe-up lg:flex lg:h-full lg:border-r-2",
					"lg:border-border-color",
				)}
			>
				{/* Mobile shows this list in a sheet instead. Rendering both would
				    duplicate the league-card ids. */}
				{isMobile ? null : leagues.length === 0 ? (
					emptyMessage
				) : (
					<LeagueSelector
						leagues={leagues}
						selectedLeagueId={selectedLeagueId ?? null}
						setSelectedLeagueId={selectLeague}
						columns={1}
						showInfo
					/>
				)}
			</div>

			<div
				ref={mapAreaRef}
				className={cn(
					"relative min-h-0 flex-1 overflow-hidden bg-bg-main lg:h-full",
				)}
			>
				{/* Absolute so the map fills the area: the flex layout above gives
				    no definite height for an h-full child to resolve against. */}
				<div className="absolute inset-0">
					<ClientOnly>
						<LeagueMap
							leagues={leagues}
							selectedLeagueId={selectedLeagueId ?? null}
							onLeagueSelect={selectLeague}
							showInfoWindow={!isMobile}
							focusOffsetY={
								isMobile ? Math.round(mapHeight * SHEET_FOCUS_SHARE) : 0
							}
						/>
					</ClientOnly>
				</div>

				<button
					type="button"
					onClick={() => setIsListOpen(true)}
					aria-expanded={isListOpen}
					className={cn(
						"absolute top-3 left-3 z-10 inline-flex items-center gap-1.5",
						"rounded-full border border-border-color bg-bg-card px-3.5 py-2",
						"text-sm font-bold text-text-main shadow-main cursor-pointer",
						"transition-colors duration-150 hover:bg-bg-card-hover",
						"focus-visible:outline-2 focus-visible:outline-offset-2",
						"focus-visible:outline-secondary lg:hidden",
					)}
				>
					<List aria-hidden="true" className="size-4" />
					Leagues
					<span className="font-semibold text-text-muted">
						{leagues.length}
					</span>
				</button>

				{isMobile &&
					(isListOpen ? (
						<MapSheet title="Leagues" onClose={() => setIsListOpen(false)}>
							{leagues.length === 0 ? (
								emptyMessage
							) : (
								<LeagueSelector
									leagues={leagues}
									selectedLeagueId={selectedLeagueId ?? null}
									setSelectedLeagueId={selectFromList}
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
								onClose={() => selectLeague(null)}
							/>
						)
					))}
			</div>
		</div>
	);
}
