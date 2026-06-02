import { CACHE_SIZE, DEFAULT_DEPTH } from "@/constant";
import { loadEvents } from "@/services/api";
import type { Event } from "@/types/Event";
import { CalendarCache } from "@/utils/CalendarCache";

export const eventCache = new CalendarCache(CACHE_SIZE);

/**
 * Fetches events for a specific month and year, stores them in the cache, and optionally pre-fetches neighboring months.
 *
 * @param {number} month - The month to fetch (1-12).
 * @param {number} year - The year to fetch.
 * @param {number} depth - How many adjacent months to recursively pre-fetch.
 * @param {(allEvents: Event[]) => void} onCacheUpdate - Optional callback triggered when new data is added to the cache.
 * @returns {Promise<Event[] | null>} A promise that resolves to the events for the requested month, or null if the fetch fails.
 */
export async function fetchAndCache({ month, year, depth = DEFAULT_DEPTH, onCacheUpdate }:{
        month: number;
        year: number;
        depth?: number;
        onCacheUpdate?: (allEvents: Event[]) => void;
    }
): Promise<Event[] | null> {
    const cacheKey = `${year}-${month}`;

    // Check cache to see if the month is already present
    if (eventCache.has(cacheKey)) {
        const data = eventCache.get(cacheKey);
        if (depth > 0) {
            preFetchNeighbors(month, year, depth, onCacheUpdate);
        }
        return data;
    }

    // Check active fetch
    const activePromise = eventCache.getFetchPromise(cacheKey);
    if (activePromise) {
        const data = await activePromise;
        if (depth > 0) {
            preFetchNeighbors(month, year, depth, onCacheUpdate);
        }
        return data;
    }

    // New fetch
    const fetchPromise = (async () => {
        try {
            const data = await loadEvents(month, year);
            eventCache.set(cacheKey, data);
            if (onCacheUpdate) {
                onCacheUpdate(eventCache.getAll());
            }
            return data;
        } catch (error) {
            console.error(`Error fetching ${cacheKey}:`, error);
            return null;
        } finally {
            eventCache.deleteFetchPromise(cacheKey);
        }
    })();

    eventCache.setFetchPromise(cacheKey, fetchPromise);
    const result = await fetchPromise;

    // fetcg neighbors
    if (depth > 0) {
        preFetchNeighbors(month, year, depth, onCacheUpdate);
    }

    return result;
}

/**
 * Recursively pre-fetches events for the previous and next months to populate the cache.
 *
 * @param {number} month - The current month (1-12).
 * @param {number} year - The current year.
 * @param {number} depth - The remaining depth of recursion for pre-fetching.
 * @param {(allEvents: Event[]) => void} onCacheUpdate - Optional callback triggered when new data is added to the cache.
 */
export function preFetchNeighbors(month: number, year: number, depth: number, onCacheUpdate?: (allEvents: Event[]) => void): void {
    const prevDate = new Date(year, month - 2, 1);
    const nextDate = new Date(year, month, 1);

    const prevMonth = prevDate.getMonth() + 1;
    const prevYear = prevDate.getFullYear();

    const nextMonth = nextDate.getMonth() + 1;
    const nextYear = nextDate.getFullYear();

    Promise.all([
        fetchAndCache({ month: prevMonth, year: prevYear, depth: depth - 1, onCacheUpdate }),
        fetchAndCache({ month: nextMonth, year: nextYear, depth: depth - 1, onCacheUpdate })
    ]);
}

/**
 * Retrieves all events from the cache.
 * @returns {Event[]} An array of all currently cached Event objects.
 */
export function getAllCachedEvents(): Event[] {
    return eventCache.getAll();
}
