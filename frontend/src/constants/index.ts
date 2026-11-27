/**
 * Global constants used for application configuration and display.
 */

import type { EventTypeMap } from '@/types/EventTypeMap';

/**
 * An array of month names for display and formatting purposes.
 */
export const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

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
 * Below this width the leagues page shows a full-screen map with a bottom sheet.
 * It matches the max-[992px] breakpoint the page used before.
 */
export const MOBILE_MAP_QUERY = '(max-width: 991px)';

/**
 * How many upcoming events the league sheet lists.
 */
export const LEAGUE_SHEET_EVENT_LIMIT = 3;

export const API_BASE_URL = '/api';

export const EVENT_TYPE_MAP: EventTypeMap = {
    CASUAL: 'C',
    STANDARD: 'S',
    CHALLENGE: '🏅',
    CUP: '🏆',
    'PRE-RELEASE': 'PR',
    SPECIAL: '📍',
    REGIONAL: '📍',
    INTERNATIONAL: 'INT',
    WORLDS: '🌍',
    LEGALITY: 'Set Legal',
    RELEASE: 'Set Release',
    REGULATION: 'Reg Legal',
};
