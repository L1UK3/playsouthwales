import { useState, useEffect, useRef } from 'react';
import { CalendarCache } from './CalendarCache';

const CACHE_SIZE = 12;

export function useEvents(currentDate: Date) {
  const [events, setEvents] = useState<any[]>([]);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [types, setTypes] = useState<Record<string, string>>({});
  const eventCache = useRef(new CalendarCache(CACHE_SIZE));

  // Fetch initial data (leagues and types)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaguesRes, typesRes] = await Promise.all([
          fetch('/leagues'),
          fetch('/types')
        ]);
        if (leaguesRes.ok) setLeagues(await leaguesRes.json());
        if (typesRes.ok) setTypes(await typesRes.json());
      } catch (e) {
        console.error("Failed to fetch initial data", e);
      }
    };
    fetchData();
  }, []);

  // Fetch events with caching and pre-fetching
  useEffect(() => {
    const fetchAndCache = async (month: number, year: number, depth: number = 1): Promise<any[] | null> => {
      const cacheKey = `${year}-${month}`;

      if (eventCache.current.has(cacheKey)) {
        const data = eventCache.current.get(cacheKey);
        setEvents(eventCache.current.getAll());
        if (depth > 0) preFetchNeighbors(month, year, depth);
        return data;
      }

      if (eventCache.current.fetchPromises.has(cacheKey)) {
        const data = await eventCache.current.fetchPromises.get(cacheKey);
        setEvents(eventCache.current.getAll());
        if (depth > 0) preFetchNeighbors(month, year, depth);
        return data || null;
      }

      const fetchPromise = (async () => {
        try {
          const res = await fetch(`/events?month=${month}&year=${year}`);
          if (res.ok) {
            const data = await res.json();
            eventCache.current.set(cacheKey, data);
            setEvents(eventCache.current.getAll());
            return data;
          }
          return null;
        } catch (e) {
          console.error(`Failed to fetch ${cacheKey}`, e);
          return null;
        } finally {
          eventCache.current.fetchPromises.delete(cacheKey);
        }
      })();

      eventCache.current.fetchPromises.set(cacheKey, fetchPromise);
      const result = await fetchPromise;
      if (depth > 0) preFetchNeighbors(month, year, depth);
      return result;
    };

    const preFetchNeighbors = (month: number, year: number, depth: number) => {
      const prevDate = new Date(year, month - 2, 1);
      const nextDate = new Date(year, month, 1);
      fetchAndCache(prevDate.getMonth() + 1, prevDate.getFullYear(), depth - 1);
      fetchAndCache(nextDate.getMonth() + 1, nextDate.getFullYear(), depth - 1);
    };

    fetchAndCache(currentDate.getMonth() + 1, currentDate.getFullYear());
  }, [currentDate]);

  return { events, leagues, types };
}
