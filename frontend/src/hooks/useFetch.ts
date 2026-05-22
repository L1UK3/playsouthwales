import { useState, useEffect } from 'react';
import type { League } from "@/types/League";
import type { EventTypes } from "@/types/EventTypes";
import type { Event } from "../types/Event";
import { fetchAndCache, loadLeagues, loadTypes, getAllCachedEvents } from '../services/api';

/**
 * Custom hook to handle initial data loading (leagues, types) 
 * and reactive event loading based on the currentDate.
 */
export function useFetch(currentDate: Date) {
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

      await fetchAndCache(month, year, 1, (updatedEvents) => {
        setAllEvents(updatedEvents);
      });

      setAllEvents(getAllCachedEvents());
    };
    fetchEvents();
  }, [currentDate]);

  return { leagues, types, allEvents };
}
