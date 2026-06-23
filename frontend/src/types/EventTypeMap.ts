/**
 * Represents a mapping of event categories (e.g., 'Tournament') to their associated abbreviation.
 * @type EventTypeMap
 * @description A dictionary where keys represent the full event type names and values represent their display titles or abbreviations.
 * 
 * @property {string} [key] - The name of the event type.
 * @property {string} [value] - The primary game or category associated with that type.
 */
export type EventTypeMap = Record<string, string>;

