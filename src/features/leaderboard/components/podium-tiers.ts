/**
 * Colours for the top three National Rankings places, shared by the podium and
 * the highlighted rows of the leaderboard table.
 */
export const PODIUM_TIERS = {
	1: {
		row: "border-l-4 border-t-1 border-amber-400 bg-amber-400/5",
		text: "text-amber-500",
		bg: "bg-amber-400/20",
		bar: "bg-amber-400",
		height: "h-36 min-[993px]:h-64",
	},
	2: {
		row: "border-l-4 border-slate-400 bg-slate-400/5",
		text: "text-slate-500",
		bg: "bg-slate-400/20",
		bar: "bg-slate-400",
		height: "h-32 min-[993px]:h-56",
	},
	3: {
		row: "border-l-4 border-amber-700 bg-amber-700/5",
		text: "text-amber-700",
		bg: "bg-amber-700/20",
		bar: "bg-amber-700",
		height: "h-28 min-[993px]:h-48",
	},
} as const;

export type PodiumPosition = keyof typeof PODIUM_TIERS;

export function podiumTier(position: number) {
	return PODIUM_TIERS[position as PodiumPosition] as
		| (typeof PODIUM_TIERS)[PodiumPosition]
		| undefined;
}
