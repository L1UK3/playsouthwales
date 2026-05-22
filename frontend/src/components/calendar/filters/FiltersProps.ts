import type { League } from "@/types/League";
import type { EventTypes } from "@/types/EventTypes";


export interface FiltersProps {
    leagues: League[];
    types: EventTypes;
    filters: {
        league: string;
        type: string;
        game: string;
    };
    onFilterChange: (name: string, value: string) => void;
    onClear: () => void;
}
