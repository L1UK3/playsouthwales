/**
 * Filters and groups events by their date string (YYYY-MM-DD).
 * @property league - The ID of the league to filter by.
 * @property type - The category of the event (e.g., 'Tournament', 'Match').
 * @property game - The specific game title to filter by.
 */
export interface EventFilters {
	league: string;
	type: string;
	game: string;
}
