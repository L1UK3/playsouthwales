import React from 'react';
import type { LeagueMapProps } from './LeagueMapProps';
import styles from './LeagueMap.module.css';

/**
 * LeagueMap component displays a map of participating leagues/stores.
 * @param props - The properties passed to the component including the list of leagues.
 * @returns JSX.Element
 */
const LeagueMap: React.FC<LeagueMapProps> = ({ leagues }) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    return (
        <div className="league-map">
            {/* Map implementation would go here */}
        </div>
    );
};

export default LeagueMap;
