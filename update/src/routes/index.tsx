import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getSchedule } from "#/features/schedule/schedule.functions";
import { selectSchedule } from "#/features/schedule/select";
import { createLeagueMap } from "#/lib/events";
import {
	currentMonthKey,
	formatMonth,
	isMonthKey,
	shiftMonth,
	todayDateKey,
} from "#/lib/month";
import { optionalId, optionalString } from "#/lib/search";
import { pageMeta } from "#/lib/seo";

interface ScheduleSearch {
	month?: string;
	view?: "list";
	day?: string;
	league?: number;
	type?: string;
	game?: string;
}

type SwipeDirection = "left" | "right" | "up" | "down" | null;

const SWIPE_CLASS: Record<NonNullable<SwipeDirection>, string> = {
	left: "animate-swipe-left",
	right: "animate-swipe-right",
	up: "animate-swipe-up",
	down: "animate-swipe-down",
};

export const Route = createFileRoute("/")({
	validateSearch: (search): ScheduleSearch => ({
		month: isMonthKey(search.month) ? search.month : undefined,
		view: search.view === "list" ? "list" : undefined,
		day: optionalString(search.day),
		league: optionalId(search.league),
		type: optionalString(search.type),
		game: optionalString(search.game),
	}),
	loaderDeps: ({ search }) => ({ month: search.month ?? currentMonthKey() }),
	loader: ({ deps }) => getSchedule({ data: deps }),
	head: () =>
		pageMeta("Event Schedule", {
			description:
				"Upcoming TCG and VGC events, local tournaments and leagues across South Wales.",
		}),
	component: SchedulePage,
});

function SchedulePage() {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const { leagues, types, events } = Route.useLoaderData();
	const [direction, setDirection] = useState<SwipeDirection>("up");

	const { month } = Route.useLoaderDeps();
	const view = search.view ?? "calendar";
	const { monthName, year } = formatMonth(month);
	const filters = useMemo(
		() => ({
			league: search.league,
			eventType: search.type,
			game: search.game,
		}),
		[search.league, search.type, search.game],
	);

	const leagueMap = useMemo(() => createLeagueMap(leagues), [leagues]);
	const schedule = useMemo(
		() => selectSchedule(events, filters, month, search.day),
		[events, filters, month, search.day],
	);

	const updateSearch = (
		patch: ScheduleSearch,
		options?: { viewTransition?: boolean },
	) =>
		navigate({
			search: (prev) => ({ ...prev, ...patch }),
			replace: true,
			...options,
		});

	const goToMonth = (delta: number) => {
		setDirection(delta < 0 ? "right" : "left");
		updateSearch({ month: shiftMonth(month, delta), day: undefined });
	};

	const goToToday = () => {
		const today = currentMonthKey();
		setDirection(today < month ? "right" : today > month ? "left" : null);
		updateSearch({ month: undefined, day: todayDateKey() });
	};

	const toggleView = () => {
		setDirection("down");
		updateSearch(
			{ view: view === "calendar" ? "list" : undefined },
			{ viewTransition: true },
		);
	};

	const selectDay = (dateKey: string) =>
		updateSearch({ day: search.day === dateKey ? undefined : dateKey });

	const changeFilter = (name: keyof typeof filters, value: string) => {
		if (name === "league") updateSearch({ league: optionalId(value) });
		if (name === "eventType") updateSearch({ type: optionalString(value) });
		if (name === "game") updateSearch({ game: optionalString(value) });
	};

	const clearFilters = () =>
		updateSearch({ league: undefined, type: undefined, game: undefined });

	const swipeClass = direction ? SWIPE_CLASS[direction] : "";

	return (
		<div className="flex flex-col animate-swipe-up">
			<h1 className="sr-only">Events Schedule South Wales</h1>
			<div className="z-10 mb-4 flex shrink-0 flex-col gap-3 rounded-lg border-2 border-border-color bg-bg-main p-3.5">
				<NavBar
					monthName={monthName}
					year={year}
					viewMode={view}
					onGoToToday={goToToday}
					onPrevMonth={() => goToMonth(-1)}
					onNextMonth={() => goToMonth(1)}
					onToggleViewMode={toggleView}
				/>
				<Filters
					leagues={leagues}
					types={types}
					filters={filters}
					onFilterChange={changeFilter}
					onClear={clearFilters}
				/>
			</div>

			<div
				key={`${view}-${month}`}
				className={`@container flex-1 ${swipeClass}`}
			>
				{view === "calendar" ? (
					<div className="flex flex-col gap-4 @6xl:flex-row">
						<div className="min-w-0 flex-1 @6xl:flex @6xl:flex-col">
							<CalendarView
								month={month}
								events={schedule.calendar}
								leagueMap={leagueMap}
								types={types}
								selectedDateKey={search.day}
								onSelectDay={selectDay}
							/>
						</div>
						<div className="w-full @6xl:relative @6xl:w-auto @6xl:max-w-100 @6xl:flex-[0_0_400px]">
							<SelectedDaySection
								month={month}
								selectedDateKey={search.day}
								selectedDayEvents={schedule.sidebar}
								leagueMap={leagueMap}
								types={types}
							/>
						</div>
					</div>
				) : (
					<ListView
						month={month}
						events={schedule.list}
						leagueMap={leagueMap}
						types={types}
					/>
				)}
			</div>
		</div>
	);
}
