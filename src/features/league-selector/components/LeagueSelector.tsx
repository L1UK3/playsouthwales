import React from "react";

import LeagueCard from "#/features/league-selector/components/LeagueCard";
import { cn } from "#/lib/utils";
import type { League } from "#/types/domain";

interface LeagueSelectorProps {
	leagues: League[];
	selectedLeagueId: number | null;
	setSelectedLeagueId: (id: number | null) => void;
	onEdit?: (league: League) => void;
	onDelete?: (league: League) => void;
	onAdd?: () => void;
	showAdminControls?: boolean;
	columns?: number;
	showInfo?: boolean;
}

/**
 * LeagueSelector component displays a grid of all participating leagues.
 * Clicking a card selects it as the active league to manage events.
 */
const LeagueSelector: React.FC<LeagueSelectorProps> = ({
	leagues,
	selectedLeagueId,
	setSelectedLeagueId,
	onEdit,
	onDelete,
	onAdd,
	showAdminControls,
	columns,
	showInfo,
}) => {
	const gridColsClass =
		{
			1: "grid-cols-1",
			2: "grid-cols-1 sm:grid-cols-2",
			3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
			4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
		}[columns ?? 3] ?? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";

	const sortedLeagues = React.useMemo(() => {
		return [...leagues].sort((a, b) => {
			const aChamp = !!a.isChampionshipSeries;
			const bChamp = !!b.isChampionshipSeries;
			if (aChamp !== bChamp) {
				return aChamp ? 1 : -1;
			}
			return a.name.localeCompare(b.name);
		});
	}, [leagues]);

	return (
		<div className="flex flex-col gap-4">
			<div className={cn("grid gap-4", gridColsClass)}>
				{sortedLeagues.map((league) => (
					<LeagueCard
						key={league.leagueId}
						league={league}
						selectedLeagueID={selectedLeagueId}
						onLeagueSelect={setSelectedLeagueId}
						onEdit={onEdit}
						onDelete={onDelete}
						showInfo={showInfo}
					/>
				))}

				{showAdminControls && (
					<button
						type="button"
						className={cn(
							"flex flex-col items-center justify-center rounded-lg border-2",
							"border-dashed border-border-color bg-transparent",
							"text-text-muted cursor-pointer",
							"transition-[border-color,color,background-color,transform,box-shadow]",
							"duration-200 ease-out",
							"hover:border-primary hover:text-primary hover:bg-primary/4",
							"hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/8",
							"min-h-28",
						)}
						onClick={onAdd}
					>
						<span
							className={cn(
								"flex flex-col items-center gap-2 font-bold text-[15px]",
							)}
						>
							<span className="text-2xl font-normal">+</span>
							<span>Add New League</span>
						</span>
					</button>
				)}
			</div>
		</div>
	);
};

export default LeagueSelector;
