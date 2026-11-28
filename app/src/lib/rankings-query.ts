/**
 * Pure request logic for `GET /api/rankings`, kept apart from the route so it
 * can be tested without the Worker runtime. The contract is documented in
 * src/routes/api/api.md.
 */
import { currentSeason } from "#/features/rankings/season";
import { ApiError } from "#/lib/api";
import type { LeaderboardPosition } from "#/types/domain";

export type RankingsQuery = ReturnType<typeof parseRankingsQuery>;

/**
 * Reads the rankings query parameters, defaulting `season` to the current
 * one. Throws a `400` ApiError for a malformed `season` or `playerId`.
 */
export function parseRankingsQuery(params: URLSearchParams, now = new Date()) {
	const season = params.get("season") ?? currentSeason(now);
	if (!/^\d{4}$/.test(season)) {
		throw new ApiError(400, "invalid_parameter", "Invalid season");
	}

	const playerId = params.get("playerId");
	if (playerId !== null && !/^\d+$/.test(playerId)) {
		throw new ApiError(400, "invalid_parameter", "Invalid playerId");
	}

	return {
		season,
		playerId: playerId === null ? null : Number(playerId),
		playerName: params.get("playerName") || null,
	};
}

/**
 * Applies the player filters to a season's ranking, keeping each player's
 * place in the full ranking. Throws a `404` ApiError when a player filter
 * matches nobody.
 */
export function filterRankings(
	ranked: readonly (LeaderboardPosition & { playerId: number | null })[],
	{ playerId, playerName }: RankingsQuery,
) {
	const matches = ranked.filter(
		(player) =>
			(playerId === null || player.playerId === playerId) &&
			(playerName === null ||
				player.name.toLowerCase().includes(playerName.toLowerCase())),
	);

	if (matches.length === 0 && (playerId !== null || playerName !== null)) {
		throw new ApiError(404, "not_found", "Unknown player");
	}

	return matches.map(({ position, name, playerId, cp }) =>
		playerId === null
			? { position, name, cp }
			: { position, name, playerId, cp },
	);
}
