import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import Card from "#/components/Card";
import {
	getAdminData,
	handleDeleteEvent,
	handleDeleteLeague,
	handleEventSubmit,
	handleExcludeEvent,
	handleLeagueSubmit,
	handleUnexcludeEvent,
} from "#/features/admin/admin.functions";
import ActiveLeaguePanel from "#/features/admin/components/ActiveLeaguePanel";
import EventFormModal from "#/features/admin/components/EventFormModal";
import LeagueFormModal from "#/features/admin/components/LeagueFormModal";
import ListView from "#/features/calendar/components/ListView";
import NavBar from "#/features/calendar/components/NavBar";
import LeagueSelector from "#/features/league-selector/components/LeagueSelector";
import { createLeagueMap, groupByDate } from "#/lib/events";
import {
	currentMonthKey,
	formatMonth,
	isMonthKey,
	shiftMonth,
} from "#/lib/month";
import { optionalId } from "#/lib/search";
import { pageMeta } from "#/lib/seo";
import { cn } from "#/lib/utils";
import type { League, ScheduleEvent } from "#/types/domain";

interface AdminSearch {
	league?: number;
	month?: string;
}

type AdminModal =
	| { kind: "league"; league?: League }
	| { kind: "event"; event?: ScheduleEvent }
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
	const router = useRouter();
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

	const commit = async (action: () => Promise<void>) => {
		await action();
		setModal(null);
		await router.invalidate();
	};

	const commitOrAlert = (action: () => Promise<void>) =>
		commit(action).catch((error: unknown) => {
			console.error("Admin save failed", error);
			window.alert(error instanceof Error ? error.message : "Save failed");
		});

	/** Runs an event-id server function for the clicked event. */
	const onEvent =
		(action: (input: { data: { id: ScheduleEvent["id"] } }) => Promise<void>) =>
		(event: ScheduleEvent) =>
			commitOrAlert(() => action({ data: { id: event.id } }));

	return (
		<div className="flex animate-swipe-up flex-col gap-5 py-4 sm:py-6">
			<h1 className="sr-only">Play! South Wales Admin Dashboard</h1>

			<Card>
				<div
					className={cn(
						"mb-4 flex flex-col gap-1.5 border-b-2 border-border-color pb-3",
					)}
				>
					<h2
						className={cn(
							"text-[clamp(1.35rem,2vw,1.85rem)] font-extrabold tracking-tight",
							"text-text-darker",
						)}
					>
						League Manager
					</h2>
					<p className="text-[14px] text-text-muted">
						Pick a league or championship series to manage its events or create
						a new series.
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
					onDelete={(league: League) =>
						commitOrAlert(() =>
							handleDeleteLeague({ data: { leagueId: league.leagueId } }),
						)
					}
					columns={4}
					showInfo={false}
				/>
			</Card>

			{activeLeague ? (
				<ActiveLeaguePanel
					key={activeLeague.leagueId}
					league={activeLeague}
					hasEvents={Object.keys(leagueEvents).length > 0}
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
						onDelete={onEvent(handleDeleteEvent)}
						onExclude={onEvent(handleExcludeEvent)}
						onUnexclude={onEvent(handleUnexcludeEvent)}
					/>
				</ActiveLeaguePanel>
			) : (
				<Card className="text-center text-text-muted">
					<h3 className="text-base font-bold text-text-darker">
						Select a league to continue
					</h3>
					<p className="mt-2 text-[14px]">
						Use the league cards above to open event tools for that league.
					</p>
				</Card>
			)}

			{modal?.kind === "league" && (
				<LeagueFormModal
					onClose={closeModal}
					onSubmit={(data) => commitOrAlert(() => handleLeagueSubmit({ data }))}
					initialData={modal.league ?? null}
				/>
			)}
			{modal?.kind === "event" && (
				<EventFormModal
					onClose={closeModal}
					onSubmit={(data) =>
						commitOrAlert(() =>
							handleEventSubmit({
								data: {
									...data,
									id: modal.event?.id,
								},
							}),
						)
					}
					initialData={modal.event ?? null}
					leagueId={search.league ?? 0}
					isChampionshipLeague={activeLeague?.isChampionshipSeries ?? false}
				/>
			)}
		</div>
	);
}
