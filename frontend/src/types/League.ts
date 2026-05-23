/**
 * Represents a competitive gaming league or store.
 * @property leagueId - Unique identifier for the league.
 * @property name - The display name of the league.
 * @property logo - Optional URL for the league's logo image.
 * @property website - Optional URL for the league's official website.
 * @property socialLink - Optional URL for the league's social media profile.
 * @property pokemonLink - Optional URL for the league's Pokemon-specific profile or page.
 * @property brandColor - Optional hex code or CSS color string for brand identity.
 * @property webLink - Optional additional web resource link.
 */
export interface League {
    leagueId: number;
    name: string;
    logo?: string;
    website?: string;
    socialLink?: string;
    pokemonLink?: string;
    brandColor?: string;
    webLink?: string;
}
