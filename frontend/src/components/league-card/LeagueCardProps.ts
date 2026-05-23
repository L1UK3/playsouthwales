import type { League } from "@/types/League";

export interface LeagueCardProps {
    key: number; 
    league: League;
    selectedLeagueID: number | null;
    onLeagueSelect: (id: number) => void;
}