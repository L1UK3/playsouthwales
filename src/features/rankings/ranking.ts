import type { LeaderboardPosition } from "#/types/domain";

/**
 * National Rankings order: most Championship Points first, then name. Each
 * player's `position` is their 1-based place in that order.
 */
export function rankPlayers(
	players: readonly { name: string; cp: number }[],
): LeaderboardPosition[] {
	return [...players]
		.sort((a, b) => b.cp - a.cp || a.name.localeCompare(b.name))
		.map((player, index) => ({ ...player, position: index + 1 }));
}
