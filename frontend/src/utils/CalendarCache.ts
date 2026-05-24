import type { Event } from "../types/Event";

/**
 * A Least Recently Used (LRU) cache for storing event data and managing active fetch requests.
 * 
 * @class CalendarCache
 * @description Implements a caching mechanism for event data using a Least Recently Used (LRU) strategy.
 * It ensures that the most recently accessed data remains available while older, 
 * unused data is evicted when the cache reaches its maximum size.
 * 
 * @example const cache = new CalendarCache(6);
 * 
 * @property {Map<string, Event[]>} cache - Internal storage for cached events.
 * @property {number} maxSize - Maximum number of entries allowed in the cache.
 * @property {Map<string, Promise<Event[] | null>>} fetchPromises - Tracking map for ongoing fetch requests.
 * 
 * @constructor
 * @param {number} [maxSize=12] - The maximum number of months to keep in the cache.
 * 
 * @method get - Retrieves events from the cache and updates their position to 'most recently used'.
 * @method set - Adds events to the cache, maintaining the maxSize limit by evicting the least recently used entry.
 * @method has - Checks if a specific key exists in the cache.
 * @method getFetchPromise - Retrieves an active fetch promise for a given key.
 * @method setFetchPromise - Stores an active fetch promise to prevent duplicate requests for the same key.
 * @method deleteFetchPromise - Removes a fetch promise from the tracking map once the request is complete.
 * @method getAll - Returns a flattened array of all events currently stored in the cache.
 * @method clear - Clears all cached event data and active fetch promises.
 */
export class CalendarCache {
    private cache: Map<string, Event[]>;
    private maxSize: number;
    private fetchPromises: Map<string, Promise<Event[] | null>>;

    /**
     * Initializes a new instance of the CalendarCache.
     * @param {number} maxSize - The maximum number of months to keep in the cache (defaults to 12).
     */
    constructor(maxSize: number = 12) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.fetchPromises = new Map();
    }

    /**
     * Retrieves events from the cache and updates their position to 'most recently used'.
     * @param {string} key - The cache key (e.g., 'YYYY-MM').
     * @returns {Event[] | null} The array of Event objects or null if not found.
     */
    get(key: string): Event[] | null {
        if (this.cache.has(key)) {
            const value = this.cache.get(key)!;
            this.cache.delete(key);
            this.cache.set(key, value);
            return value;
        }
        return null;
    }

    /**
     * Adds events to the cache, maintaining the maxSize limit by evicting the least recently used entry.
     * @param {string} key - The cache key (e.g., 'YYYY-MM').
     * @param {Event[]} value - The array of Event objects to store.
     */
    set(key: string, value: Event[]): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey !== undefined) {
                this.cache.delete(oldestKey);
            }
        }
        this.cache.set(key, value);
    }

    /**
     * Checks if a specific key exists in the cache.
     * @param {string} key - The cache key (e.g., 'YYYY-MM').
     * @returns {boolean} True if the key is present in the cache, otherwise false.
     */
    has(key: string): boolean {
        return this.cache.has(key);
    }

    /**
     * Retrieves an active fetch promise for a given key.
     * @param {string} key - The cache key (e.g., 'YYYY-MM').
     * @returns {Promise<Event[] | null> | undefined} The active Promise or undefined if no fetch is in progress.
     */
    getFetchPromise(key: string): Promise<Event[] | null> | undefined {
        return this.fetchPromises.get(key);
    }

    /**
     * Stores an active fetch promise to prevent duplicate requests for the same key.
     * @param {string} key - The cache key (e.g., 'YYYY-MM').
     * @param {Promise<Event[] | null>} promise - The promise representing the active fetch request.
     */
    setFetchPromise(key: string, promise: Promise<Event[] | null>): void {
        this.fetchPromises.set(key, promise);
    }

    /**
     * Removes a fetch promise from the tracking map once the request is complete.
     * @param {string} key - The cache key (e.g., 'YYYY-MM').
     */
    deleteFetchPromise(key: string): void {
        this.fetchPromises.delete(key);
    }

    /**
     * Returns a flattened array of all events currently stored in the cache.
     * @returns {Event[]} An array containing all cached Event objects.
     */
    getAll(): Event[] {
        const all: Event[] = [];
        for (const value of this.cache.values()) {
            all.push(...value);
        }
        return all;
    }

    /**
     * Clears all cached event data and active fetch promises.
     */
    clear(): void {
        this.cache.clear();
        this.fetchPromises.clear();
    }
}
