import type { MarkerData } from "#/features/map/types/markerData";
import type { League } from "#/types/domain";

/** Brand colour for a league that has not set one. */
export const DEFAULT_BRAND_COLOR = "#e31d23";

/**
 * A league's venue as a map position, or null when the league has no
 * coordinates and so cannot go on the map.
 */
export function getLeaguePosition(
	league: League,
): { lat: number; lng: number } | null {
	if (league.latitude == null || league.longitude == null) return null;
	return { lat: league.latitude, lng: league.longitude };
}

export function mapLeaguesToMarkers(leagues: League[]): MarkerData[] {
	return leagues.flatMap((league) => {
		const position = getLeaguePosition(league);
		if (!position) return [];
		return [
			{
				id: league.leagueId,
				position,
				name: league.name,
				brandColor: league.brandColor ?? DEFAULT_BRAND_COLOR,
				logo: league.logo,
				location: league.location,
				website: league.website,
				eventLink: league.eventLink,
			},
		];
	});
}

/**
 * Finds the selected league's details from the full leagues array.
 */
export function getSelectedLeague(
	leagues: League[],
	selectedId: number | null,
): League | null {
	if (selectedId === null) return null;
	return leagues.find((l) => l.leagueId === selectedId) ?? null;
}
