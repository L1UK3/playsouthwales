import type { LeaderboardPosition } from "#/types/domain";

/**
 * National Rankings order: most Championship Points first, then name. Each
 * player's `position` is their 1-based place in that order. Other properties
 * of each player are kept.
 */
export function rankPlayers<T extends { name: string; cp: number }>(
	players: readonly T[],
): (T & LeaderboardPosition)[] {
	return [...players]
		.sort((a, b) => b.cp - a.cp || a.name.localeCompare(b.name))
		.map((player, index) => ({ ...player, position: index + 1 }));
}
