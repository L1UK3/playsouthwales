/**
 * Pure request logic for `GET /api/rankings`, kept apart from the route so it
 * can be tested without the Worker runtime. The contract is documented in
 * src/routes/api/api.md.
 */
import { rankPlayers } from "#/features/rankings/ranking";
import { currentSeason } from "#/features/rankings/season";
import { ApiError } from "#/lib/api";

export interface RankingsQuery {
	season: string;
	playerId?: number;
	playerName?: string;
}

const SEASON_PATTERN = /^\d{4}$/;
const PLAYER_ID_PATTERN = /^\d+$/;

/**
 * Reads the rankings query parameters, defaulting `season` to the current
 * one. Throws a `400` ApiError for a malformed `season` or `playerId`.
 */
export function parseRankingsQuery(
	params: URLSearchParams,
	now = new Date(),
): RankingsQuery {
	const query: RankingsQuery = { season: currentSeason(now) };

	const season = params.get("season");
	if (season !== null) {
		if (!SEASON_PATTERN.test(season)) {
			throw new ApiError(
				400,
				"invalid_parameter",
				"Invalid season: expected YYYY",
			);
		}
		query.season = season;
	}

	const playerId = params.get("playerId");
	if (playerId !== null) {
		const id = Number(playerId);
		if (!PLAYER_ID_PATTERN.test(playerId) || !Number.isSafeInteger(id)) {
			throw new ApiError(
				400,
				"invalid_parameter",
				"Invalid playerId: expected an integer",
			);
		}
		query.playerId = id;
	}

	const playerName = params.get("playerName")?.trim();
	if (playerName) query.playerName = playerName;

	return query;
}

/** A player's row for one season, as stored. */
export interface SeasonPlayer {
	name: string;
	playerId: number | null;
	cp: number;
}

/** One entry of the `rankings` list in the response. */
export interface Ranking {
	position: number;
	name: string;
	playerId?: number;
	cp: number;
}

/**
 * Ranks a season's players and applies the player filters. Positions come from
 * the full season ranking, so a filtered player keeps their place. Throws a
 * `404` ApiError when a player filter matches nobody.
 */
export function buildRankings(
	players: readonly SeasonPlayer[],
	query: RankingsQuery,
): Ranking[] {
	const { playerId, playerName } = query;
	const needle = playerName?.toLowerCase();
	const ranked = rankPlayers(players).filter(
		(player) =>
			(playerId === undefined || player.playerId === playerId) &&
			(needle === undefined || player.name.toLowerCase().includes(needle)),
	);

	if (ranked.length === 0 && (playerId !== undefined || needle !== undefined)) {
		throw new ApiError(404, "not_found", "Unknown player");
	}

	return ranked.map(({ position, name, playerId, cp }) =>
		playerId === null
			? { position, name, cp }
			: { position, name, playerId, cp },
	);
}
