
/**
 * Data required to plot and interact with a league marker on the Google Map.
 */
export interface MarkerData {
    id: number;
    position: {
        lat: number;
        lng: number;
    };
    name: string;
    brandColor: string;
    logo?: string;
    location?: string;
    website?: string;
    pokemonLink?: string;
}


