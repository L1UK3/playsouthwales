import React from 'react';
import styles from './filters.module.css';
import type { League } from '@/types/League';
import type { EventTypes } from '@/types/EventTypes';

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

/**
 * Filters component provides dropdown menus to filter events by league, event type, and game category.
 * @param props - The properties passed to the component including leagues, types, current filters, and change handlers.
 * @returns JSX.Element
 */
const Filters: React.FC<FiltersProps> = ({ leagues, types, filters, onFilterChange, onClear }) => {
    return (
        <div className={styles.filters} id="view-filters">
            <select
                id="league-filter"
                className={styles.formControl}
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
                className={styles.formControl}
                value={filters.type}
                onChange={(e) => onFilterChange('type', e.target.value)}
            >
                <option value="">All Event Types</option>
                {Object.keys(types).map(type => (
                    <option key={type} value={type}>
                        {types[type] ? `[${types[type]}] ${type}` : type}
                    </option>
                ))}
            </select>

            <select
                id="game-filter"
                className={styles.formControl}
                value={filters.game}
                onChange={(e) => onFilterChange('game', e.target.value)}
            >
                <option value="">All Games</option>
                <option value="TCG">TCG</option>
                <option value="VGC">VGC</option>
            </select>

            <button type="button" className={`${styles.clearFilters} btn btn-primary`} onClick={onClear}>Clear</button>
        </div>
    );
};

export default Filters;
