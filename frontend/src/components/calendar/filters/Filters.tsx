import React from 'react';
import type { FiltersProps } from './FiltersProps';
import styles from './filters.module.css';

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
