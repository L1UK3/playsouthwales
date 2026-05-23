import type { League } from "@/types/League";
import type { EventTypes } from "@/types/EventTypes";
import type { Event } from "../types/Event";
import { CalendarCache } from '../utils/CalendarCache';
import { CACHE_SIZE, DEFAULT_DEPTH } from '../constant';

const eventCache = new CalendarCache(CACHE_SIZE);

/**
 * Fetches events for a specific month and year from the API.
 * 
 * @param month - The month to fetch (1-12).
 * @param year - The year to fetch.
 * @returns A promise that resolves to an array of Event objects.
 */
export async function loadEvents(month: number, year: number): Promise<Event[]> {
    
    try {
        const response = await fetch(`/events?month=${month}&year=${year}`);
        if (!response.ok) {
            throw new Error('Failed to fetch events: ' + response.statusText);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
}

/**
 * Fetches events for a specific month and year, stores them in the cache, and optionally pre-fetches neighboring months.
 * 
 * @param month - The month to fetch (1-12).
 * @param year - The year to fetch.
 * @param depth - How many adjacent months to recursively pre-fetch.
 * @param onCacheUpdate - Optional callback triggered when new data is added to the cache.
 * @returns A promise that resolves to the events for the requested month, or null if the fetch fails.
 */
export async function fetchAndCache(month: number, year: number, depth: number = DEFAULT_DEPTH, onCacheUpdate?: (allEvents: Event[]) => void): Promise<Event[] | null> {
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
 * @param month - The current month (1-12).
 * @param year - The current year.
 * @param depth - The remaining depth of recursion for pre-fetching.
 * @param onCacheUpdate - Optional callback triggered when new data is added to the cache.
 */
function preFetchNeighbors(month: number, year: number, depth: number, onCacheUpdate?: (allEvents: Event[]) => void): void {


    const prevDate = new Date(year, month - 2, 1);
    const nextDate = new Date(year, month, 1);

    const prevMonth = prevDate.getMonth() + 1;
    const prevYear = prevDate.getFullYear();

    const nextMonth = nextDate.getMonth() + 1;
    const nextYear = nextDate.getFullYear();

    Promise.all([
        fetchAndCache(prevMonth, prevYear, depth - 1, onCacheUpdate),
        fetchAndCache(nextMonth, nextYear, depth - 1, onCacheUpdate)
    ]);
}


/**
 * Fetches event types.
 * @returns A promise that resolves to an EventTypes object. 
 */
export async function loadTypes(): Promise<EventTypes> {

    try {
        const response = await fetch('/types');
        if (!response.ok) {
            throw new Error('Failed to fetch event types: ' + response.statusText);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching event types:', error);
        throw error;
    }
}
/**
 * Fetches available leagues.
 * @returns A promise that resolves to an array of League objects.
 */
export async function loadLeagues(): Promise<League[]> {

    try {
        const response = await fetch('/leagues');
        if (!response.ok) {
            throw new Error('Failed to fetch leagues: ' + response.statusText);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching leagues:', error);
        throw error;
    }
}

/**
 * Retrieves all events from the cache.
 */
export function getAllCachedEvents(): Event[] {
    return eventCache.getAll();
}
