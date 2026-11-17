/**
 * Filters and groups events by their date string (YYYY-MM-DD).
 * @property {string} league - The ID of the league to filter by.
 * @property {string} eventType - The category of the event (e.g., 'Tournament', 'Match').
 * @property {string} game - The specific game title to filter by.
 */
export interface EventFilters {
    league: string;
    eventType: string;
    game: string;
}
