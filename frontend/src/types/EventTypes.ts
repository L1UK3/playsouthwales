/**
 * Represents a mapping of event categories (e.g., 'Tournament') to their associated abbreviation.
 * @type EventTypes
 * @description A dictionary where keys represent the full event type names and values represent their display titles or abbreviations.
 * 
 * @property {string} [key] - The name of the event type.
 * @property {string} [value] - The primary game or category associated with that type.
 * * 
 * @example
 * {
 *   "Tournament": "TCG",
 *   "League Challenge": "TCG",
 *   "Video Game Midseason Showdown": "VGC"
 * }
 */
export type EventTypes = Record<string, string>;
