import type { League } from "@/types/League";

/**
 * Properties for the LeagueMap component, displaying leagues on an interactive map.
 * @property leagues - Array of League objects to be plotted on the map.
 * @property selectedLeagueId - The ID of the currently focused league.
 * @property onLeagueSelect - Callback function triggered when a marker is clicked.
 */
export interface LeagueMapProps {
    leagues: League[];
    selectedLeagueId: number | null;
    onLeagueSelect: (id: number) => void;
}