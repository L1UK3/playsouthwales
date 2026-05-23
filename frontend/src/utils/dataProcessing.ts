import type { League } from "@/types/League";
import type { Event } from "../types/Event";
import type { EventFilters } from "./EventFilters";

/**
 * Creates a map of league IDs to league objects for efficient lookup.
 * @param leagues - Array of League objects.
 * @returns A record where keys are league IDs and values are League objects.
 */
export const createLeagueMap = (leagues: League[]): Record<number, League> =>
	leagues.reduce((acc, l) => ({ ...acc, [l.leagueId]: l }), {} as Record<number, League>);

/**
 * Filters and groups events based on the provided criteria and organizes them by date.
 * @param allEvents - Array of all available Event objects.
 * @param filters - The criteria used to filter events (league, type, and game).
 * @returns A record where keys are date strings (YYYY-MM-DD) and values are arrays of Event objects.
 */
export const filterAndGroupEvents = (allEvents: Event[], filters: EventFilters): Record<string, Event[]> => {
	const filtered = allEvents.filter(event => {
		if (filters.league && String(event.leagueId) !== filters.league) return false;
		if (filters.type && event.type !== filters.type) return false;
		if (filters.game && event.game !== filters.game) return false;
		return true;
	});

	return filtered.reduce((acc, event) => {
		const dateKey = event.date.slice(0, 10);
		if (!acc[dateKey]) acc[dateKey] = [];
		acc[dateKey].push(event);
		return acc;
	}, {} as Record<string, Event[]>);
};
