import type { League } from "@/types/League";
import type { MarkerData } from "@map/types/markerData";


export function mapLeaguesToMarkers(leagues: League[]): MarkerData[] {
    return leagues
        .filter(
            (league): league is League & { latitude: number; longitude: number } =>
                league.latitude !== null &&
                league.latitude !== undefined &&
                league.longitude !== null &&
                league.longitude !== undefined
        )
        .map(league => ({
            id: league.leagueId,
            position: {
                lat: league.latitude,
                lng: league.longitude,
            },
            name: league.name,
            brandColor: league.brandColor ?? '#e31d23',
            logo: league.logo,
            location: league.location,
            website: league.website,
            pokemonLink: league.pokemonLink,
        }));
}

/**
 * Finds the selected league's details from the full leagues array.
 */
export function getSelectedLeague(leagues: League[], selectedId: number | null): League | null {
    if (selectedId === null) return null;
    return leagues.find(l => l.leagueId === selectedId) ?? null;
}

