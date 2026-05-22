import type { Event, League, EventTypes } from '../types';

/**
 * Returns a date string in YYYY-MM-DD format based on the local time of the provided Date object.
 */
export function getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

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
