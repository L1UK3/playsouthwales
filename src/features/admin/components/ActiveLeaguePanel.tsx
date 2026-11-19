import type { ReactNode } from "react";
import Card from "#/components/Card";
import { cn } from "#/lib/utils";
import type { League } from "#/types/domain";

interface ActiveLeaguePanelProps {
	league: League;
	hasEvents: boolean;
	onAddEvent: () => void;
	navigation: ReactNode;
	children: ReactNode;
}

export default function ActiveLeaguePanel({
	league,
	hasEvents,
	onAddEvent,
	navigation,
	children,
}: ActiveLeaguePanelProps) {
	const championship = league.isChampionshipSeries;
	const addEventLabel = championship
		? "Add Championship Event"
		: "Schedule New Event";

	return (
		<Card className={cn("flex animate-swipe-down flex-col gap-5")}>
			<div
				className={cn(
					"flex flex-col gap-3 border-b-2 border-border-color pb-3 sm:flex-row sm:items-center sm:justify-between",
				)}
			>
				<div>
					<h3 className={cn("text-base font-bold")}>
						{championship ? "Championship Events" : "Scheduled Events"} (
						{league.name})
					</h3>
					<p className={cn("text-[12px] text-text-muted")}>
						Edit the schedule or individual events for this league.
					</p>
				</div>
				<div className={cn("grid gap-2 sm:grid-cols-2 sm:justify-end")}>
					<button
						type="button"
						className={cn("btn btn-primary min-h-11 w-full")}
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
				<div className={cn("px-5 py-12 text-center text-text-muted")}>
					<h4 className={cn("mb-2 text-lg font-bold")}>No Events Scheduled</h4>
					<p className={cn("text-[15px]")}>
						There are no events this month. Select &ldquo;{addEventLabel}
						&rdquo; to create one.
					</p>
				</div>
			)}
		</Card>
	);
}
