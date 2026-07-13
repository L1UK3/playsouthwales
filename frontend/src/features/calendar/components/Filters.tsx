import React from 'react';

import type { League } from '@/types/League';
import type { EventTypeMap } from '@/types/EventTypeMap';

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
    types: EventTypeMap;
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
        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2.5 w-full" id="view-filters">
            <div className="w-full sm:flex-1 sm:min-w-[150px] flex flex-col">
                <label htmlFor="league-filter" className="sr-only">Filter by League</label>
                <select
                    id="league-filter"
                    className="py-1.5 px-2.5 rounded-md border border-border-color text-xs sm:text-sm bg-bg-card text-text-main transition-[background-color,border-color] duration-150 ease-out focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] w-full cursor-pointer"
                    value={filters.league}
                    onChange={(e) => onFilterChange('league', e.target.value)}
                >
                    <option value="">All Leagues</option>
                    {leagues.map(l => (
                        <option key={l.leagueId} value={l.leagueId}>{l.name}</option>
                    ))}
                </select>
            </div>

            <div className="w-full sm:flex-1 sm:min-w-[150px] flex flex-col">
                <label htmlFor="type-filter" className="sr-only">Filter by Event Type</label>
                <select
                    id="type-filter"
                    className="py-1.5 px-2.5 rounded-md border border-border-color text-xs sm:text-sm bg-bg-card text-text-main transition-[background-color,border-color] duration-150 ease-out focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] w-full cursor-pointer"
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
            </div>

            <div className="w-full sm:flex-1 sm:min-w-[110px] flex flex-col">
                <label htmlFor="game-filter" className="sr-only">Filter by Game</label>
                <select
                    id="game-filter"
                    className="py-1.5 px-2.5 rounded-md border border-border-color text-xs sm:text-sm bg-bg-card text-text-main transition-[background-color,border-color] duration-150 ease-out focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] w-full cursor-pointer"
                    value={filters.game}
                    onChange={(e) => onFilterChange('game', e.target.value)}
                >
                    <option value="">All Games</option>
                    <option value="TCG">TCG</option>
                    <option value="VGC">VGC</option>
                    <option value="GO">GO</option>
                </select>
            </div>

            <button 
                type="button" 
                className="btn btn-primary py-1.5 w-full sm:w-auto sm:shrink-0 sm:min-w-[80px]" 
                onClick={onClear}
            >
                Clear
            </button>
        </div>
    );
};

export default Filters;
