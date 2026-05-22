import type { League } from "@/types/League";
import type { Event } from "../types/Event";
import type { EventFilters } from "./EventFilters";

/**
 * Creates a map of league IDs to league objects for efficient lookup.
 */
export const createLeagueMap = (leagues: League[]): Record<number, League> =>
  leagues.reduce((acc, l) => ({ ...acc, [l.leagueId]: l }), {} as Record<number, League>);

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
