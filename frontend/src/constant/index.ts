/**
 * Global constants used for application configuration and display.
 */

/**
 * An array of month names for display and formatting purposes.
 */
export const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

/**
 * The maximum number of months to store in the event cache
 */
export const CACHE_SIZE = 12;

/**
 * The default number of adjacent months to pre-fetch when loading event data.
 */
export const DEFAULT_DEPTH = 1;

/**
 * The default center of the map, based on an approximate geographical
 * center of South Wales
 */
export const DEFAULT_CENTER = {
    lat: 51.58,
    lng: -3.58
};

/**
 * The default zoom level for the map.
 */
export const DEFAULT_ZOOM = 9;
