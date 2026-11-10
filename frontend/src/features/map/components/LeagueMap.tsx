import React, { useRef } from 'react';
import {
    APIProvider,
    Map,
    AdvancedMarker,
    CollisionBehavior,
    ColorScheme,
} from '@vis.gl/react-google-maps';
import type { League } from '@/types/League';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@constants';
import { useSettings } from '@/context/SettingsContext';
import MapHandler, { type CameraSnapshot } from '../helper/MapHandler';
import InfoBox from './InfoBox';
import LeagueMarker from './LeagueMarker';
import useMarker from '../hooks/useMarker';

/**
 * Google's demo Map ID, which shows Google's default map style. Set
 * VITE_GOOGLE_MAPS_MAP_ID to use the templates in docs/map-styles instead.
 */
const FALLBACK_MAP_ID = 'DEMO_MAP_ID';

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
 * The map's colour scheme follows the site's dark-mode setting.
 * @param {LeagueMapProps} props - The properties for the LeagueMap component.
 * @returns {JSX.Element} The rendered league map.
 */
const LeagueMap: React.FC<LeagueMapProps> = ({
    leagues,
    selectedLeagueId,
    onLeagueSelect,
}) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- an empty value must fall back too
    const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || FALLBACK_MAP_ID;
    const { settings } = useSettings();
    const colorScheme = settings.darkMode
        ? ColorScheme.DARK
        : ColorScheme.LIGHT;

    // Google rebuilds the map when the colour scheme changes. This ref keeps
    // the camera across that rebuild, so the view stays put.
    const cameraRef = useRef<CameraSnapshot | null>(null);

    const {
        markers,
        selectedLeague,
        handleMarkerClick,
        handleMapClick,
        handleCloseInfoWindow,
    } = useMarker({
        leagues,
        selectedLeagueId,
        onLeagueSelect,
    });

    if (!apiKey) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center border-2 border-dashed border-border-color rounded-lg bg-bg-card text-text-muted min-h-75">
                <p className="font-bold text-[16px] text-text-main mb-2">
                    Map Unavailable
                </p>
                <p className="text-sm max-w-sm">
                    Configure <code>VITE_GOOGLE_MAPS_API_KEY</code> in your
                    frontend environment to view local league venues.
                </p>
            </div>
        );
    }

    return (
        <APIProvider apiKey={apiKey}>
            <div className="w-full h-full overflow-hidden">
                <Map
                    defaultCenter={DEFAULT_CENTER}
                    defaultZoom={DEFAULT_ZOOM}
                    className="w-full h-full"
                    mapId={mapId}
                    colorScheme={colorScheme}
                    onClick={handleMapClick}
                    streetViewControl={false}
                    mapTypeControl={false}
                    fullscreenControl={false}
                >
                    {markers.map((marker) => {
                        const isSelected = marker.id === selectedLeagueId;

                        return (
                            <AdvancedMarker
                                key={marker.id}
                                position={marker.position}
                                title={marker.name}
                                zIndex={isSelected ? 1000 : undefined}
                                collisionBehavior={
                                    CollisionBehavior.REQUIRED_AND_HIDES_OPTIONAL
                                }
                                onClick={(e) =>
                                    handleMarkerClick(marker.id, e.domEvent)
                                }
                            >
                                <LeagueMarker
                                    marker={marker}
                                    isSelected={isSelected}
                                />
                            </AdvancedMarker>
                        );
                    })}

                    {selectedLeague && (
                        <InfoBox
                            selectedLeague={selectedLeague}
                            onCloseClick={handleCloseInfoWindow}
                        />
                    )}

                    <MapHandler
                        selectedLeague={selectedLeague}
                        defaultCenter={DEFAULT_CENTER}
                        defaultZoom={DEFAULT_ZOOM}
                        cameraRef={cameraRef}
                    />
                </Map>
            </div>
        </APIProvider>
    );
};

export default LeagueMap;
