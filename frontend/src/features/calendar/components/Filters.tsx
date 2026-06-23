import React from 'react';

import type { League } from '@/types/League';
import type { EventTypes } from '@/types/EventTypeMap';

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
        eventType: string;
        game: string;
    };
    onFilterChange: (name: string, value: string) => void;
    onClear: () => void;
}

/**
 * Filters component provides dropdown menus to filter events by league, event type, and game category.
 * @param props - The properties passed to the component including leagues, types, current filters, and change handlers.
 * @returns JSX.Element
 */
const Filters: React.FC<FiltersProps> = ({ leagues, types, filters, onFilterChange, onClear }) => {
    return (
        <div className="flex gap-2 flex-wrap items-center w-full" id="view-filters">
            <select
                id="league-filter"
                className="flex-1 py-1.5 px-2.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] min-w-37.5"
                value={filters.league}
                onChange={(e) => onFilterChange('league', e.target.value)}
            >
                <option value="">All Leagues</option>
                {leagues.map(l => (
                    <option key={l.leagueId} value={l.leagueId}>{l.name}</option>
                ))}
            </select>

            <select
                id="type-filter"
                className="flex-1 py-1.5 px-2.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] min-w-37.5"
                value={filters.eventType}
                onChange={(e) => onFilterChange('eventType', e.target.value)}
            >
                <option value="">All Event Types</option>
                {Object.keys(types).map(eventType => (
                    <option key={eventType} value={eventType}>
                        {types[eventType] ? `[${types[eventType]}] ${eventType}` : eventType}
                    </option>
                ))}
            </select>

            <select
                id="game-filter"
                className="flex-1 py-1.5 px-2.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] min-w-30"
                value={filters.game}
                onChange={(e) => onFilterChange('game', e.target.value)}
            >
                <option value="">All Games</option>
                <option value="TCG">TCG</option>
                <option value="VGC">VGC</option>
                <option value="GO">GO</option>
            </select>

            <button type="button" className={"btn btn-primary shrink-0 min-w-20"} onClick={onClear}>Clear</button>
        </div>
    );
};

export default Filters;
