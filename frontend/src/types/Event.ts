/**
 * Represents a scheduled event within the system.
 * @interface Event
 * @description Defines the structure of an event object, including its timing, location (league), and categorization.
 * 
 * @example
 * {
 *   id: 1,
 *   name: "Regional Championship",
 *   date: "2023-10-15",
 *   leagueId: 101,
 *   type: "Tournament",
 *   game: "Pokémon TCG"
 * }
 * 
 * @property {number} id - Unique identifier for the event.
 * @property {string} name - The title or name of the event.
 * @property {string} date - The date of the event (ISO 8601 format: YYYY-MM-DD).
 * @property {string} [startTime] - Optional starting time of the event.
 * @property {number} leagueId - The ID of the league hosting the event.
 * @property {string} [leagueName] - Optional name of the league for display purposes.
 * @property {string} [ticketLink] - Optional URL for purchasing tickets or registration.
 * @property {string} type - The category of the event (e.g., 'Tournament', 'Match').
 * @property {string} game - The specific game title associated with the event.
 * @property {string} [description] - Optional detailed information about the event.
 * @property {string} [prizes] - Optional information regarding the prize pool or rewards.
 * @property {string} [entryFee] - Optional cost associated with participating in the event.
 */
export interface Event {
    id: number;
    name: string;
    date: string;
    startTime?: string;
    leagueId: number;
    leagueName?: string;
    ticketLink?: string;
    eventType: string;
    game: string;
    description?: string;
    prizes?: string;
    entryFee?: string;
    isRecurring?: boolean;
    recurringEventId?: number;
    excludedDates?: string[];
}


