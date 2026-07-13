import React from 'react';
import {
    APIProvider,
    Map,
    AdvancedMarker,
    Pin,
} from '@vis.gl/react-google-maps';
import type { League } from '@/types/League';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@constants';
import MapHandler from '../helper/MapHandler';
import InfoBox from './InfoBox';
import useMarker from '../hooks/useMarker';

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
 * @param {LeagueMapProps} props - The properties for the LeagueMap component.
 * @returns {JSX.Element} The rendered league map.
 */
const LeagueMap: React.FC<LeagueMapProps> = ({
    leagues,
    selectedLeagueId,
    onLeagueSelect,
}) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

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

    return (
        <APIProvider apiKey={apiKey}>
            <div className="w-full h-full overflow-hidden">
                <Map
                    defaultCenter={DEFAULT_CENTER}
                    defaultZoom={DEFAULT_ZOOM}
                    className="w-full h-full"
                    mapId="DEMO_MAP_ID"
                    onClick={handleMapClick}
                >
                    {markers.map((marker) => {
                        const isSelected = marker.id === selectedLeagueId;

                        return (
                            <AdvancedMarker
                                key={marker.id}
                                position={marker.position}
                                onClick={(e) =>
                                    handleMarkerClick(marker.id, e.domEvent)
                                }
                            >
                                <Pin
                                    background={marker.brandColor}
                                    borderColor="#111111"
                                    glyphColor="#FFFFFF"
                                    scale={isSelected ? 1.2 : 0.9}
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
                    />
                </Map>
            </div>
        </APIProvider>
    );
};

export default LeagueMap;
