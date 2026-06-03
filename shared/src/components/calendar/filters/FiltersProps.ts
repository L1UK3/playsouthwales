import type { League } from "../../../types/League";
import type { EventTypes } from "../../../types/EventTypes";

/**
 * Properties for the Filters component, enabling users to refine the list of displayed events.

 * @property leagues - Array of available leagues to filter by.
 * @property types - Mapping of event types to their associated games for selection.
 * @property filters - The current state of active filter selections.
 * @property onFilterChange - Callback function triggered when a filter value is updated.
 * @property onClear - Callback function to reset all active filters to their default state.
 */
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
