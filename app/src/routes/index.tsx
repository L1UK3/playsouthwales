import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import CalendarView from "#/features/calendar/components/CalendarView";
import Filters from "#/features/calendar/components/Filters";
import ListView from "#/features/calendar/components/ListView";
import NavBar from "#/features/calendar/components/NavBar";
import SelectedDaySection from "#/features/calendar/components/SelectedDaySection";
import { getSchedule } from "#/features/schedule/schedule.functions";
import {
	filtersFromSearch,
	validateScheduleSearch,
} from "#/features/schedule/search";
import { selectSchedule } from "#/features/schedule/select";
import {
	type UpdateScheduleSearch,
	useScheduleNavigation,
} from "#/features/schedule/useScheduleNavigation";
import { createLeagueMap } from "#/lib/events";
import { currentMonthKey, formatMonth } from "#/lib/month";
import { pageMeta } from "#/lib/seo";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/")({
	validateSearch: validateScheduleSearch,
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
	const { month } = Route.useLoaderDeps();
	const { monthName, year } = formatMonth(month);

	const updateSearch: UpdateScheduleSearch = (patch, options) =>
		navigate({
			search: (prev) => ({ ...prev, ...patch }),
			replace: true,
			...options,
		});
	const {
		view,
		swipeClass,
		goToMonth,
		goToToday,
		toggleView,
		selectDay,
		changeFilter,
		clearFilters,
	} = useScheduleNavigation(month, search, updateSearch);

	const { league, type, game } = search;
	const filters = useMemo(
		() => filtersFromSearch({ league, type, game }),
		[league, type, game],
	);
	const leagueMap = useMemo(() => createLeagueMap(leagues), [leagues]);
	const schedule = useMemo(
		() => selectSchedule(events, filters, month, search.day),
		[events, filters, month, search.day],
	);

	return (
		<div className="flex flex-col animate-swipe-up">
			<h1 className="sr-only">Events Schedule South Wales</h1>
			<div
				className={cn(
					"z-10 mb-4 flex shrink-0 flex-col gap-3 rounded-lg border-2",
					"border-border-color bg-bg-main p-3.5",
				)}
			>
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
				className={cn("@container flex-1", swipeClass)}
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
						<div
							className={cn(
								"w-full @6xl:relative @6xl:w-auto @6xl:max-w-100",
								"@6xl:flex-[0_0_400px]",
							)}
						>
							<SelectedDaySection
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
