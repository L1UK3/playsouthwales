import React from "react";
import { cn } from "#/lib/utils";
import type { LeaderboardPosition } from "#/types/domain";
import { LeaderboardPodium } from "./leaderboard-podium";
import { podiumTier } from "./podium-tiers";
import { RankBadge } from "./RankBadge";
import { SkeletonRow } from "./SkeletonRow";

export const TOP_CUTOFF_THRESHOLD = 20;
export const TOP_CUTOFF_POSITION = TOP_CUTOFF_THRESHOLD + 1;
const SKELETON_ROW_KEYS = [
	"skeleton-1",
	"skeleton-2",
	"skeleton-3",
	"skeleton-4",
	"skeleton-5",
	"skeleton-6",
	"skeleton-7",
	"skeleton-8",
];

const COLUMN_COUNT = 3;

export interface LeaderboardProps {
	/** Already in National Rankings order, as returned by getRankings. */
	players: LeaderboardPosition[];
	isLoading?: boolean;
}

const LeaderboardHeader = () => (
	<th className="py-2 px-3 text-right pr-4">Championship Points</th>
);

const LeaderboardMetrics: React.FC<{ player: LeaderboardPosition }> = ({
	player,
}) => (
	<td className="py-1.5 px-3 text-right pr-4 text-sm font-bold">
		{player.cp ?? 0}
	</td>
);

const Leaderboard: React.FC<LeaderboardProps> = ({
	players: sortedPlayers,
	isLoading = false,
}) => {
	const showPodium = !isLoading && sortedPlayers.length > 0;

	return (
		<div
			className={cn(
				"grid min-h-0 w-full flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)]",
				"animate-swipe-up",
				showPodium &&
					cn(
						"min-[993px]:grid-cols-[minmax(240px,0.75fr)_minmax(0,1.75fr)]",
						"min-[993px]:grid-rows-1",
					),
			)}
		>
			{showPodium ? (
				<LeaderboardPodium
					players={sortedPlayers}
					className={cn(
						"min-h-full shrink-0 border-border-color pb-4 pt-6",
						"min-[993px]:flex min-[993px]:items-center",
						"min-[993px]:justify-center min-[993px]:pb-0 min-[993px]:pt-0",
					)}
				/>
			) : null}

			<div
				className={cn(
					"min-h-0 min-w-0 overflow-auto border-border-color bg-bg-card",
					"shadow-xs",
					showPodium
						? "rounded-b-lg border-t min-[993px]:rounded-bl-none"
						: "rounded-b-lg",
				)}
			>
				<table className="w-full border-collapse text-left">
					<thead className="sticky top-0 bg-bg-card z-10">
						<tr
							className={cn(
								"text-[11px] font-bold text-text-muted uppercase",
								"tracking-wider bg-bg-main/50 backdrop-blur-md",
							)}
						>
							<th className="py-2 px-3 w-16 text-center">Rank</th>
							<th className="py-2 px-3">Player</th>
							<LeaderboardHeader />
						</tr>
					</thead>

					<tbody className="divide-y divide-border-color/50">
						{isLoading ? (
							SKELETON_ROW_KEYS.map((key) => <SkeletonRow key={key} />)
						) : sortedPlayers.length === 0 ? (
							<tr>
								<td
									colSpan={COLUMN_COUNT}
									className="text-center py-12 text-sm text-text-muted"
								>
									No players found.
								</td>
							</tr>
						) : (
							sortedPlayers.map((player) => {
								const rank = player.position;
								const renderCutoff = rank === TOP_CUTOFF_POSITION;

								return (
									<React.Fragment
										key={player.userId ?? `${rank}-${player.name}`}
									>
										{renderCutoff ? (
											<tr className="bg-bg-main/30">
												<td
													colSpan={COLUMN_COUNT}
													className={cn(
														"py-2 px-3 text-center text-xs font-bold",
														"text-text-muted border-t border-b",
														"border-border-color border-dashed uppercase",
														"tracking-wider select-none",
													)}
												>
													Top 20 Cutoff
												</td>
											</tr>
										) : null}
										<tr
											className={cn(
												"hover:bg-bg-card-hover/60",
												"transition-[background-color] duration-150 group",
												"cursor-pointer",
												podiumTier(rank)?.row,
											)}
										>
											<td
												className={cn(
													"py-1.5 px-3 flex justify-center items-center",
												)}
											>
												<RankBadge position={rank} />
											</td>
											<td
												className={cn(
													"py-1.5 px-3 text-sm font-semibold text-text-main",
													"group-hover:text-text-darker transition-[color]",
													"duration-150",
												)}
											>
												<div className="flex items-center gap-2">
													<span>{player.name}</span>
												</div>
											</td>
											<LeaderboardMetrics player={player} />
										</tr>
									</React.Fragment>
								);
							})
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default Leaderboard;
