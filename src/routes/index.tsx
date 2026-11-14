import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: SchedulePage });

function SchedulePage() {
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
