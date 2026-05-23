import type { League } from "@/types/League";

/**
 * Properties for the LeaguesPage component, displaying a list of available leagues.
 * @interface LeaguesPageProps
 * @description Defines the state required to render the leagues overview interface.
 * @property {League[]} leagues - List of all available leagues to be displayed.
 */
export interface LeaguesPageProps {
    leagues: League[];
}
