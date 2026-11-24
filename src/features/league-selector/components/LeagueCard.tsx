/* Hallmark · component: card · genre: modern-minimal · theme: custom (design.md)
 * contrast: pass (46–50)
 */
import type React from "react";
import { cn } from "#/lib/utils";
import type { League } from "#/types/domain";
import LeagueInfo from "./LeagueInfo";

interface LeagueCardProps {
	league: League;
	selectedLeagueID: number | null;
	onLeagueSelect: (id: number) => void;
	onEdit?: (league: League) => void;
	onDelete?: (league: League) => void;
	showInfo?: boolean;
}

/** Gold styling for Championship Series leagues, as on their event cards. */
const CHAMPIONSHIP_CLASSES = cn(
	"border-2 border-(--store-color) bg-linear-to-br from-yellow-600/[0.5]",
	"to-transparent shadow-md shadow-amber-500/5",
);

const STORE_CLASSES = cn(
	"border-2 border-(--store-color) bg-bg-card text-text-main",
	"shadow-[0_0_8px_color-mix(in_oklch,var(--store-color)_15%,transparent)]",
);

const SELECTED_CLASSES = cn(
	"bg-(--store-color)/12! ring-2 ring-focus ring-offset-1 scale-[1.01]",
	"shadow-md shadow-(--store-color)/5",
);

/**
 * LeagueCard shows one league in the LeagueSelector. The whole card selects
 * the league; admins also get Edit and Delete buttons.
 */
const LeagueCard: React.FC<LeagueCardProps> = ({
	league,
	selectedLeagueID,
	onLeagueSelect,
	onEdit,
	onDelete,
	showInfo = true,
}) => {
	const isSelected = selectedLeagueID === league.leagueId;
	const brandColor = league.brandColor ?? "var(--color-primary)";
	const isChampionship = league.isChampionshipSeries ?? false;

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onLeagueSelect(league.leagueId);
		}
	};

	return (
		// biome-ignore lint/a11y/useSemanticElements: the card contains nested interactive controls, so it cannot be a <button>
		<div
			id={`league-card-${league.leagueId}`}
			role="button"
			tabIndex={0}
			className={cn(
				"flex flex-col gap-3 p-4 rounded-xl transition-all duration-200",
				"outline-hidden cursor-pointer",
				isChampionship ? CHAMPIONSHIP_CLASSES : STORE_CLASSES,
				isSelected ? SELECTED_CLASSES : "opacity-85 hover:opacity-100",
				"hover:-translate-y-0.5 hover:shadow-md hover:bg-bg-card-hover",
				"active:scale-[0.99] active:translate-y-px",
			)}
			style={{ "--store-color": brandColor } as React.CSSProperties}
			onClick={() => onLeagueSelect(league.leagueId)}
			onKeyDown={handleKeyDown}
		>
			<div className="flex items-center gap-3">
				{league.logo ? (
					<img
						src={league.logo}
						alt={league.name}
						width="32"
						height="32"
						loading="lazy"
						decoding="async"
						className={cn(
							"size-8 rounded-lg object-contain bg-white border",
							"border-border-color shrink-0 p-1",
						)}
					/>
				) : (
					<div
						className={cn(
							"size-8 rounded-lg bg-bg-main border border-border-color",
							"shrink-0 flex items-center justify-center text-xs font-bold",
							"text-text-muted",
						)}
					>
						{league.name.charAt(0)}
					</div>
				)}

				<div className="flex flex-col gap-0.5 grow min-w-0">
					<h3
						className={cn(
							"text-sm font-bold text-text-darker truncate flex items-center",
							"gap-1.5 leading-snug",
						)}
					>
						{isChampionship && (
							<span className="text-amber-500 text-xs shrink-0">🏆</span>
						)}
						<span className="truncate">{league.name}</span>
					</h3>
				</div>
			</div>

			{showInfo && <LeagueInfo league={league} />}

			{(onEdit ?? onDelete) && (
				<div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-border-color/30">
					{onEdit && (
						<button
							type="button"
							className="btn btn-secondary text-xs py-1.5 px-3"
							onClick={(e) => {
								e.stopPropagation();
								onEdit(league);
							}}
						>
							Edit
						</button>
					)}
					{onDelete && !isChampionship && (
						<button
							type="button"
							className={cn(
								"btn btn-secondary text-xs py-1.5 px-3 border-red-500!",
								"text-red-600! dark:text-red-400! bg-red-500/5!",
								"hover:bg-red-500/10!",
							)}
							onClick={(e) => {
								e.stopPropagation();
								onDelete(league);
							}}
						>
							Delete
						</button>
					)}
				</div>
			)}
		</div>
	);
};

export default LeagueCard;
