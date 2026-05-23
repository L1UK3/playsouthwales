import { useState, useEffect } from 'react';
import type { League } from "@/types/League";
import type { EventTypes } from "@/types/EventTypes";
import type { Event } from "../types/Event";
import { loadLeagues, loadTypes } from '../services/api';
import { getAllCachedEvents } from "@/utils/useCache";
import { fetchAndCache } from "@/utils/useCache";

/**
 * Fetches events for a specific month and year from the API.
 * 
 * @param month - The month to fetch (1-12).
 * @param year - The year to fetch.
 * @returns A promise that resolves to an array of Event objects.
 */
export function useFetch(currentDate: Date): { leagues: League[]; types: EventTypes; allEvents: Event[]; } {
	
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
