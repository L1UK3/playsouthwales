import React from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import type { LeagueMapProps } from './LeagueMapProps';
import styles from './LeagueMap.module.css';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@/constant';

/**
 * LeagueMap component displays a Google Map with markers for each league.
 * @param {LeagueMapProps} props - The properties for the LeagueMap component, including the list of leagues and selection handlers.
 * @returns {JSX.Element} The rendered league map.
 */
const LeagueMap: React.FC<LeagueMapProps> = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    return (
        <APIProvider apiKey={apiKey}>
            <div className={styles.mapContainer}>
                <Map
                    defaultCenter={DEFAULT_CENTER}
                    defaultZoom={DEFAULT_ZOOM}
                    className={styles.mapCanvas}
                />
            </div>
        </APIProvider>
    );
};

export default LeagueMap;
