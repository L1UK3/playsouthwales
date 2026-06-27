/**
 * Represents a competitive gaming league or store.
 * @interface League
 * @description Defines the structure of a league object, including its identification, branding, and external links.
 * 
 * @example
 * {
 *   leagueId: 101,
 *   name: "Card Kingdom",
 *   logo: "/logos/card-kingdom.png",
 *   website: "https://www.cardkingdom.com",
 *   brandColor: "#e31d23",
 *   socialLink: "https://facebook.com/cardkingdom",
 *   location: "Seattle, WA"
 *   latitude: 47.6623,
 *   longitude: -122.3819
 *   pokemonLink: "https://events.pokemon.com/en-us/leagues/101"
 *   webLink: "https://example.com"
 * }
 * 
 * @property {number} leagueId - Unique identifier for the league.
 * @property {string} name - The display name of the league or store.
 * @property {string} [logo] - Optional URL or path to the league's logo image.
 * @property {string} [website] - Optional URL to the league's official website.
 * @property {string} [socialLink] - Optional URL to the league's primary social media profile.
 * @property {string} [pokemonLink] - Optional URL to the league's official Pokémon event page.
 * @property {string} [brandColor] - Optional hex code or CSS color representing the league's branding.
 * @property {string} [webLink] - Optional additional web resource link.
 * @property {string} [location] - Optional physical address or location name of the league.
 * @property {number} [latitude] - Optional geographic latitude for mapping.
 * @property {number} [longitude] - Optional geographic longitude for mapping.
 */
export interface League {
    directions?: string;
    accessibility?: string;
    id?: number;
    leagueId: number;
    name: string;
    logo?: string;
    website?: string;
    socialLink?: string;
    pokemonLink?: string;
    brandColor?: string;
    webLink?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
}
