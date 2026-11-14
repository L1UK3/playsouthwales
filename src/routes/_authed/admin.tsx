import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import Card from "#/components/Card";
import { getAdminData } from "#/features/admin/admin.functions";
import ActiveLeaguePanel from "#/features/admin/components/ActiveLeaguePanel";
import { createLeagueMap, groupByDate } from "#/lib/events";
import {
	currentMonthKey,
	formatMonth,
	isMonthKey,
	shiftMonth,
} from "#/lib/month";
import { optionalId } from "#/lib/search";
import { pageMeta } from "#/lib/seo";
import type { League, ScheduleEvent } from "#/types/domain";

interface AdminSearch {
	league?: number;
	month?: string;
}

type AdminModal =
	| { kind: "league"; league?: League }
	| { kind: "event"; event?: ScheduleEvent }
	| { kind: "leaderboard"; leagueId: number }
	| { kind: "nationalRankings" }
	| null;

export const Route = createFileRoute("/_authed/admin")({
	validateSearch: (search): AdminSearch => ({
		league: optionalId(search.league),
		month: isMonthKey(search.month) ? search.month : undefined,
	}),
	loaderDeps: ({ search }) => ({ month: search.month ?? currentMonthKey() }),
	loader: ({ deps }) => getAdminData({ data: deps }),
	head: () => pageMeta("Admin Dashboard", { noindex: true }),
	component: AdminPage,
});

function AdminPage() {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const { leagues, types, events } = Route.useLoaderData();
	const [modal, setModal] = useState<AdminModal>(null);

	const { month } = Route.useLoaderDeps();
	const { monthName, year } = formatMonth(month);
	const activeLeague = leagues.find(
		(league) => league.leagueId === search.league,
	);

	const leagueMap = useMemo(() => createLeagueMap(leagues), [leagues]);
	const leagueEvents = useMemo(
		() =>
			groupByDate(events.filter((event) => event.leagueId === search.league)),
		[events, search.league],
	);

	const updateSearch = (patch: AdminSearch) =>
		navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

	const closeModal = () => setModal(null);

	const openStandings = () => {
		if (!activeLeague) return;
		setModal(
			activeLeague.isChampionshipSeries
				? { kind: "nationalRankings" }
				: { kind: "leaderboard", leagueId: activeLeague.leagueId },
		);
	};

	return (
		<div className="flex animate-swipe-up flex-col gap-5 py-4 sm:py-6">
			<h1 className="sr-only">Play! South Wales Admin Dashboard</h1>

			<Card>
				<div className="mb-4 flex flex-col gap-1.5 border-b-2 border-border-color pb-3">
					<h2 className="text-[clamp(1.35rem,2vw,1.85rem)] font-extrabold tracking-tight text-text-darker">
						League Manager
					</h2>
					<p className="text-[14px] text-text-muted">
						Pick a league or championship series to manage its events, update
						standings, or create a new series.
					</p>
				</div>
				<LeagueSelector
					leagues={leagues}
					selectedLeagueId={search.league ?? null}
					setSelectedLeagueId={(id: number | null) =>
						updateSearch({ league: id ?? undefined })
					}
					showAdminControls
					onAdd={() => setModal({ kind: "league" })}
					onEdit={(league: League) => setModal({ kind: "league", league })}
					onDelete={handleDeleteLeague}
					columns={4}
					showInfo={false}
				/>
			</Card>

			{activeLeague ? (
				<ActiveLeaguePanel
					key={activeLeague.leagueId}
					league={activeLeague}
					hasEvents={Object.keys(leagueEvents).length > 0}
					onEditStandings={openStandings}
					onAddEvent={() => setModal({ kind: "event" })}
					navigation={
						<NavBar
							monthName={monthName}
							year={year}
							onGoToToday={() => updateSearch({ month: undefined })}
							onPrevMonth={() => updateSearch({ month: shiftMonth(month, -1) })}
							onNextMonth={() => updateSearch({ month: shiftMonth(month, 1) })}
						/>
					}
				>
					<ListView
						events={leagueEvents}
						leagueMap={leagueMap}
						types={types}
						onEdit={(event: ScheduleEvent) =>
							setModal({ kind: "event", event })
						}
						onDelete={handleDeleteEvent}
						onExclude={handleExcludeEvent}
						onUnexclude={handleUnexcludeEvent}
					/>
				</ActiveLeaguePanel>
			) : (
				<Card className="text-center text-text-muted">
					<h3 className="text-base font-bold text-text-darker">
						Select a league to continue
					</h3>
					<p className="mt-2 text-[14px]">
						Use the league cards above to open event tools and standings for
						that league.
					</p>
				</Card>
			)}

			{modal?.kind === "league" && (
				<LeagueFormModal
					isOpen
					onClose={closeModal}
					onSubmit={handleLeagueSubmit}
					initialData={modal.league ?? null}
				/>
			)}
			{modal?.kind === "event" && (
				<EventFormModal
					isOpen
					onClose={closeModal}
					onSubmit={handleEventSubmit}
					initialData={modal.event ?? null}
					leagueId={search.league ?? 0}
					isChampionshipLeague={activeLeague?.isChampionshipSeries ?? false}
				/>
			)}
			{modal?.kind === "leaderboard" && (
				<LeaderboardFormModal
					isOpen
					onClose={closeModal}
					onSubmit={handleLeaderboardSubmit}
					leagueId={modal.leagueId}
				/>
			)}
			{modal?.kind === "nationalRankings" && (
				<NationalRankingsModal
					isOpen
					onClose={closeModal}
					onSubmit={handleNationalRankingsSubmit}
					initialPlayers={[]}
				/>
			)}
		</div>
	);
}
