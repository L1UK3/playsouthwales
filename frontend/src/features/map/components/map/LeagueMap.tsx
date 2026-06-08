import React from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import styles from '@map/components/map/LeagueMap.module.css';
import type { League } from '@/types/League';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@constants';

/**
 * Properties for the LeagueMap component, displaying leagues on an interactive map.
 * @property leagues - Array of League objects to be plotted on the map.
 * @property selectedLeagueId - The ID of the currently focused league.
 * @property onLeagueSelect - Callback function triggered when a marker is clicked.
 */
export interface LeagueMapProps {
    leagues: League[];
    selectedLeagueId: number | null;
    onLeagueSelect: (id: number | null) => void;
}

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
