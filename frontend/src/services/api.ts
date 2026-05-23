import type { League } from "@/types/League";
import type { EventTypes } from "@/types/EventTypes";
import type { Event } from "../types/Event";

/**
 * Fetches events for a specific month and year from the API.
 * 
 * @param {number} month - The month to fetch (1-12).
 * @param {number} year - The year to fetch.
 * @returns {Promise<Event[]>} A promise that resolves to an array of Event objects.
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
 * Fetches event types.
 * @returns {Promise<EventTypes>} A promise that resolves to an EventTypes object.
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
 * @returns {Promise<League[]>} A promise that resolves to an array of League objects.
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


