import { cn } from "#/lib/utils";
import type { LeaderboardPosition } from "#/types/domain";
import { podiumTier } from "./podium-tiers";
import { RankBadge } from "./RankBadge";

/** Display order on the podium: second place left, first centre, third right. */
const PODIUM_ORDER = [2, 1, 3];

interface LeaderboardPodiumProps {
	/** Ranked players; only positions 1 to 3 are drawn. */
	players: LeaderboardPosition[];
	className?: string;
}

export const LeaderboardPodium = ({
	players,
	className,
}: LeaderboardPodiumProps) => {
	const podium = PODIUM_ORDER.flatMap((position) => {
		const player = players.find((p) => p.position === position);
		const tier = podiumTier(position);
		return player && tier ? [{ player, tier }] : [];
	});

	if (podium.length === 0) return null;

	return (
		<ul
			className={cn(
				"flex items-end justify-center gap-4 min-[993px]:gap-10",
				className,
			)}
			aria-label="Top 3 rankings"
		>
			{podium.map(({ player, tier }) => {
				const points = player.cp.toLocaleString();

				return (
					<li
						key={player.position}
						aria-label={`Rank ${player.position}: ${player.name}, ${points}`}
						className={cn(
							"flex flex-col items-center min-[993px]:h-full",
							"min-[993px]:justify-end",
						)}
					>
						<div className="relative mb-2" aria-hidden="true">
							<div
								className={cn(
									"flex items-center justify-center rounded-full",
									"h-16 w-16 text-xl min-[993px]:h-24 min-[993px]:w-24",
									"min-[993px]:text-3xl",
									tier.bg,
								)}
							>
								<RankBadge position={player.position} />
							</div>
						</div>

						<span
							className="max-w-28 truncate text-center font-medium text-base"
							title={player.name}
						>
							{player.name}
						</span>

						<span
							className={cn("mt-2 h-1.5 w-20 rounded-full", tier.bar)}
							aria-hidden="true"
						/>

						<span className="text-muted-foreground tabular-nums text-sm">
							{points}
						</span>

						<div
							aria-hidden="true"
							className={cn(
								"mt-3 w-20 rounded-t-lg min-[993px]:w-28",
								tier.height,
								tier.bg,
								"rounded-t-xl",
							)}
						>
							<div
								className={cn(
									"flex h-8 items-center justify-center font-bold",
									tier.text,
								)}
							>
								{player.position}
							</div>
						</div>
					</li>
				);
			})}
		</ul>
	);
};
