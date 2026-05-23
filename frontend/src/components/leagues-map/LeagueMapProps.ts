import type { League } from "@/types/League";

/**
 * Properties for the LeagueMap component, displaying leagues on an interactive map.
 * @property leagues - Array of League objects to be plotted on the map.
 */
export interface LeagueMapProps {
    leagues: League[];
}