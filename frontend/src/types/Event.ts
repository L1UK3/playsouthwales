/**
 * Represents a scheduled event within the system.
 * 
 * @property id - Unique identifier for the event.
 * @property name - The title or name of the event.
 * @property date - The date of the event (ISO 8601 format: YYYY-MM-DD).
 * @property startTime - Optional starting time of the event.
 * @property leagueId - The ID of the league hosting the event.
 * @property leagueName - Optional name of the league for display purposes.
 * @property ticketLink - Optional URL for purchasing tickets or registration.
 * @property type - The category of the event (e.g., 'Tournament', 'Match').
 * @property game - The specific game title associated with the event.
 * @property description - Optional detailed information about the event.
 * @property prizes - Optional information regarding the prize pool or rewards.
 * @property entryFee - Optional cost associated with participating in the event.
 */
export interface Event {
    id: number;
    name: string;
    date: string;
    startTime?: string;
    leagueId: number;
    leagueName?: string;
    ticketLink?: string;
    type: string;
    game: string;
    description?: string;
    prizes?: string;
    entryFee?: string;
}


