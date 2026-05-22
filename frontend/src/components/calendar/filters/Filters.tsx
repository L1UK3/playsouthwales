import React from 'react';
import type { League, EventTypes } from '../../../types';

interface FiltersProps {
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

const Filters: React.FC<FiltersProps> = ({ leagues, types, filters, onFilterChange, onClear }) => {
    return (
        <div className="filters" id="view-filters">
            <select 
                id="league-filter" 
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
                value={filters.game} 
                onChange={(e) => onFilterChange('game', e.target.value)}
            >
                <option value="">All Games</option>
                <option value="TCG">TCG</option>
                <option value="VGC">VGC</option>
            </select>
            
            <button type="button" className="clear-filters" onClick={onClear}>Clear</button>
        </div>
    );
};

export default Filters;
