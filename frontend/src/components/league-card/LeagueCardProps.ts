import type { League } from '@types/League';

/**
 * @interface LeagueCardProps
 * @description Properties for the LeagueCard component.
 * @property {number} key - Unique identifier for the component instance.
 * @property {League} league - The league object containing details to display.
 * @property {number | null} selectedLeagueID - The ID of the currently selected league.
 * @property {(id: number) => void} onLeagueSelect - Callback function triggered when a league is selected.
 */
export interface LeagueCardProps {
    key: number;
    league: League;
    selectedLeagueID: number | null;
    onLeagueSelect: (id: number) => void;
}