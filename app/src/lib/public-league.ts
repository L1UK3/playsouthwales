import type { League } from "#/types/domain";

/** A league as `GET /api/leagues` sends it. See src/routes/api/api.md. */
export interface PublicLeague {
	leagueId: number;
	name: string;
	location?: string;
	latitude?: number;
	longitude?: number;
	directions?: string;
	accessibility?: string;
	logo?: string;
	brandColor?: string;
	website?: string;
	socialLink?: string;
	eventLink?: string;
	webLink?: string;
	isChampionshipSeries: boolean;
}

type OptionalKey = Exclude<
	keyof PublicLeague,
	"leagueId" | "name" | "isChampionshipSeries"
>;

const OPTIONAL_KEYS = [
	"location",
	"latitude",
	"longitude",
	"directions",
	"accessibility",
	"logo",
	"brandColor",
	"website",
	"socialLink",
	"eventLink",
	"webLink",
] as const satisfies readonly OptionalKey[];

/**
 * Maps a league to its public shape: only the documented properties, with
 * absent or null optionals left out rather than sent as null.
 */
export function toPublicLeague(
	league: League & { webLink?: string | null },
): PublicLeague {
	const source = league as Partial<Record<OptionalKey, unknown>>;
	const result: PublicLeague = {
		leagueId: league.leagueId,
		name: league.name,
		isChampionshipSeries: league.isChampionshipSeries === true,
	};
	for (const key of OPTIONAL_KEYS) {
		const value = source[key];
		if (value !== null && value !== undefined) {
			(result as unknown as Record<string, unknown>)[key] = value;
		}
	}
	return result;
}
