import React from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import type { LeagueMapProps } from './LeagueMapProps';
import styles from './LeagueMap.module.css';

/**
 * LeagueMap component displays a Google Map with markers for each league.
 * @param props - The properties for the LeagueMap component, including the list of leagues and selection handlers.
 * @returns JSX.Element
 */
const LeagueMap: React.FC<LeagueMapProps> = ({  }) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    return (
        <APIProvider apiKey={apiKey}>
            <div className={styles.mapContainer}>
            </div>
        </APIProvider>
    );
};

export default LeagueMap;
