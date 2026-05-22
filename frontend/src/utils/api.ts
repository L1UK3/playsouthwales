import type { Event, League, EventTypes } from '../types';
import { CalendarCache } from './CalendarCache';
import { CACHE_SIZE, DEFAULT_DEPTH } from '../constant';

const eventCache = new CalendarCache(CACHE_SIZE);

/**
 * Returns a date string in YYYY-MM-DD format based on the local time of the provided Date object.
 */
export function getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Fetches events for a specific month and year.
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
 * Fetches and caches events for a specific month and year, including neighbors.
 */
export async function fetchAndCache(
    month: number, 
    year: number, 
    depth: number = DEFAULT_DEPTH,
    onCacheUpdate?: (allEvents: Event[]) => void
): Promise<Event[] | null> {
    const cacheKey = `${year}-${month}`;

    // 1. Check cache
    if (eventCache.has(cacheKey)) {
        const data = eventCache.get(cacheKey);
        if (depth > 0) {
            preFetchNeighbors(month, year, depth, onCacheUpdate);
        }
        return data;
    }

    // 2. Check active fetch
    const activePromise = eventCache.getFetchPromise(cacheKey);
    if (activePromise) {
        const data = await activePromise;
        if (depth > 0) {
            preFetchNeighbors(month, year, depth, onCacheUpdate);
        }
        return data;
    }

    // 3. New fetch
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

    // 4. Neighbors
    if (depth > 0) {
        preFetchNeighbors(month, year, depth, onCacheUpdate);
    }

    return result;
}

/**
 * Pre-fetches adjacent months.
 */
function preFetchNeighbors(
    month: number, 
    year: number, 
    depth: number,
    onCacheUpdate?: (allEvents: Event[]) => void
): void {
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
 * Returns all events currently in the cache.
 */
export function getAllCachedEvents(): Event[] {
    return eventCache.getAll();
}

/**
 * Fetches event types.
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
 * Fetches leagues.
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
