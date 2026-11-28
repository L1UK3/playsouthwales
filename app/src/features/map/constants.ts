/**
 * The default center of the map, based on an approximate geographical
 * center of South Wales
 */
export const DEFAULT_CENTER = {
	lat: 51.58,
	lng: -3.58,
};

/**
 * The default zoom level for the map.
 */
export const DEFAULT_ZOOM = 9;

/**
 * How many upcoming events the league sheet lists.
 */
export const LEAGUE_SHEET_EVENT_LIMIT = 3;

/**
 * Below this width the leagues page shows a full-screen map with bottom
 * sheets instead of the info box. It matches Tailwind's `lg` breakpoint,
 * which the page layout uses.
 */
export const MOBILE_MAP_QUERY = "(max-width: 1023.98px)";
