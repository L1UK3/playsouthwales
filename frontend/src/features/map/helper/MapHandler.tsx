import React, { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import type { League } from '@/types/League';

interface MapHandlerProps {
    selectedLeague: League | null;
    defaultCenter: { lat: number; lng: number };
    defaultZoom: number;
}

/**
 * MapHandler is a controller component that adjusts the Google Map camera view (pan/zoom)
 * when the selected league changes.
 */
export const MapHandler: React.FC<MapHandlerProps> = ({
    selectedLeague,
    defaultCenter,
    defaultZoom,
}) => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        if (selectedLeague?.latitude !== undefined && selectedLeague?.longitude !== undefined) {
            map.panTo({ lat: selectedLeague.latitude, lng: selectedLeague.longitude });
            map.setZoom(13);
        } else {
            map.panTo(defaultCenter);
            map.setZoom(defaultZoom);
        }
    }, [map, selectedLeague, defaultCenter, defaultZoom]);

    return null;
};

export default MapHandler;
