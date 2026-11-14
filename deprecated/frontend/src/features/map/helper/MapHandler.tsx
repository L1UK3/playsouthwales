import React, { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import type { League } from '@/types/League';

/** Zoom level the camera uses when it focuses on a selected league. */
const SELECTED_ZOOM = 13;

/**
 * Moves a latitude south by a number of screen pixels at a zoom level, using
 * Web Mercator maths. Centring the camera there shows the point that many
 * pixels above the middle of the map.
 */
function offsetLatitude(lat: number, offsetPx: number, zoom: number): number {
    if (offsetPx === 0) return lat;

    const worldSize = 256 * 2 ** zoom;
    const sinLat = Math.sin((lat * Math.PI) / 180);
    const y =
        (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) *
        worldSize;
    const n = Math.PI - (2 * Math.PI * (y + offsetPx)) / worldSize;
    return (180 / Math.PI) * Math.atan(Math.sinh(n));
}

/**
 * A saved camera position. The parent keeps it so it survives a map rebuild.
 */
export interface CameraSnapshot {
    center: { lat: number; lng: number };
    zoom: number;
    selectedLeagueId: number | null;
}

interface MapHandlerProps {
    selectedLeague: League | null;
    defaultCenter: { lat: number; lng: number };
    defaultZoom: number;
    /** Holds the last camera position. The parent owns it, so it outlives this component. */
    cameraRef: React.RefObject<CameraSnapshot | null>;
    /** Pixels to show a selected league above the map's centre, for example above a bottom sheet. */
    focusOffsetY?: number;
}

/**
 * MapHandler is a controller component that adjusts the Google Map camera view (pan/zoom)
 * when the selected league changes.
 *
 * The map rebuilds when the colour scheme changes, which remounts this component.
 * It then restores the saved camera, so a theme switch keeps the current view.
 */
export const MapHandler: React.FC<MapHandlerProps> = ({
    selectedLeague,
    defaultCenter,
    defaultZoom,
    cameraRef,
    focusOffsetY = 0,
}) => {
    const map = useMap();
    const selectedLeagueId = selectedLeague?.leagueId ?? null;

    useEffect(() => {
        if (!map) return;

        // Same selection as the saved camera: the map was rebuilt, so restore the view.
        const snapshot = cameraRef.current;
        if (snapshot?.selectedLeagueId === selectedLeagueId) {
            map.moveCamera({ center: snapshot.center, zoom: snapshot.zoom });
            return;
        }

        if (
            selectedLeague?.latitude !== null &&
            selectedLeague?.latitude !== undefined &&
            selectedLeague?.longitude !== null &&
            selectedLeague?.longitude !== undefined
        ) {
            map.panTo({
                lat: offsetLatitude(
                    selectedLeague.latitude,
                    focusOffsetY,
                    SELECTED_ZOOM
                ),
                lng: selectedLeague.longitude,
            });
            map.setZoom(SELECTED_ZOOM);
        } else {
            map.panTo(defaultCenter);
            map.setZoom(defaultZoom);
        }
    }, [
        map,
        selectedLeague,
        selectedLeagueId,
        defaultCenter,
        defaultZoom,
        cameraRef,
        focusOffsetY,
    ]);

    // Save the camera each time the map settles after a pan or zoom.
    useEffect(() => {
        if (!map) return;

        const listener = map.addListener('idle', () => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            if (!center || zoom === undefined) return;

            cameraRef.current = {
                center: center.toJSON(),
                zoom,
                selectedLeagueId,
            };
        });

        return () => listener.remove();
    }, [map, cameraRef, selectedLeagueId]);

    return null;
};

export default MapHandler;
