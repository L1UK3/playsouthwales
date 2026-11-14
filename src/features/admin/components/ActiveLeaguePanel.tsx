import type { ReactNode } from "react";
import Card from "#/components/Card";
import type { League } from "#/types/domain";

interface ActiveLeaguePanelProps {
	league: League;
	hasEvents: boolean;
	onEditStandings: () => void;
	onAddEvent: () => void;
	navigation: ReactNode;
	children: ReactNode;
}

export default function ActiveLeaguePanel({
	league,
	hasEvents,
	onEditStandings,
	onAddEvent,
	navigation,
	children,
}: ActiveLeaguePanelProps) {
	const championship = league.isChampionshipSeries;
	const addEventLabel = championship
		? "Add Championship Event"
		: "Schedule New Event";

	return (
		<Card className="flex animate-swipe-down flex-col gap-5">
			<div className="flex flex-col gap-3 border-b-2 border-border-color pb-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h3 className="text-base font-bold">
						{championship ? "Championship Events" : "Scheduled Events"} (
						{league.name})
					</h3>
					<p className="text-[12px] text-text-muted">
						Edit the schedule, standings, or individual entries for this league.
					</p>
				</div>
				<div className="grid gap-2 sm:grid-cols-2 sm:justify-end">
					<button
						type="button"
						className="btn btn-secondary min-h-11 w-full"
						onClick={onEditStandings}
					>
						{championship ? "Edit National Rankings" : "Edit Standings"}
					</button>
					<button
						type="button"
						className="btn btn-primary min-h-11 w-full"
						onClick={onAddEvent}
					>
						{addEventLabel}
					</button>
				</div>
			</div>

			{navigation}

			{hasEvents ? (
				children
			) : (
				<div className="px-5 py-12 text-center text-text-muted">
					<h4 className="mb-2 text-lg font-bold">No Events Scheduled</h4>
					<p className="text-[15px]">
						There are no events this month. Select &ldquo;{addEventLabel}
						&rdquo; to create one.
					</p>
				</div>
			)}
		</Card>
	);
}
