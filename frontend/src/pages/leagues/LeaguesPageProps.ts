import type { League } from "@/types/League";

/**
 * Properties for the LeaguesPage component, displaying a list of available leagues.
 * @property leagues - Array of League objects to be displayed.
 */
export interface LeaguesPageProps {
    leagues: League[];
}
