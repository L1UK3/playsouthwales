import { useState, useEffect } from 'react';
import type { League } from "@/types/League";
import type { EventTypes } from "@/types/EventTypes";
import type { Event } from "@/types/Event";
import { loadLeagues, loadTypes } from '@services/api';
import { getAllCachedEvents, fetchAndCache } from '@hooks/useCache';

/**
 * Fetches events for a specific month and year from the API.
 * @param {Date} currentDate - The current date used to determine which month's events to fetch.
 * @returns { League, EventTypes, Event } An object containing arrays of leagues, event types, and all fetched events.
 */
export function useFetch(currentDate: Date): {
	leagues: League[];
	types: EventTypes;
	allEvents: Event[];
} {
	const [leagues, setLeagues] = useState<League[]>([]);
	const [types, setTypes] = useState<EventTypes>({});
	const [allEvents, setAllEvents] = useState<Event[]>([]);

	// Initial Data Load (Leagues & Types)
	useEffect(() => {
		const init = async () => {
			try {
				const [leaguesData, typesData] = await Promise.all([loadLeagues(), loadTypes()]);
				setLeagues(leaguesData);
				setTypes(typesData);
			} catch (e) {
				console.error("Initialization failed", e);
			}
		};
		init();
	}, []);

	// Event Loading (on month change)
	useEffect(() => {
		const fetchEvents = async () => {
			const month = currentDate.getMonth() + 1;
			const year = currentDate.getFullYear();

			await fetchAndCache({
				month, year, depth: 1, onCacheUpdate: (updatedEvents) => {
					setAllEvents(updatedEvents);
				}
			});

			setAllEvents(getAllCachedEvents());
		};
		fetchEvents();
	}, [currentDate]);

	return { leagues, types, allEvents };
}
