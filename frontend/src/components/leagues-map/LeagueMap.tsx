import React from 'react';
import { APIProvider, Map, Marker, InfoWindow, useMarkerRef } from '@vis.gl/react-google-maps';
import type { LeagueMapProps } from './LeagueMapProps';
import styles from './LeagueMap.module.css';

const LeagueMap: React.FC<LeagueMapProps> = ({ leagues, selectedLeagueId, onLeagueSelect }) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const [infoWindowOpen, setInfoWindowOpen] = React.useState(false);
    const [selectedLeague, setSelectedLeague] = React.useState<typeof leagues[0] | null>(null);
    const [markerRef, marker] = useMarkerRef();

    // Default center (Wales)
    const defaultCenter = { lat: 52.1307, lng: -3.7837 };

    const handleMarkerClick = (league: typeof leagues[0]) => {
        setSelectedLeague(league);
        setInfoWindowOpen(true);
        onLeagueSelect(league.leagueId);
    };

    if (!apiKey) {
        return (
            <div className={styles.mapError}>
                <p>Google Maps API key is missing. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.</p>
            </div>
        );
    }

    return (
        <APIProvider apiKey={apiKey}>
            <div className={styles.mapContainer}>
                <Map
                    defaultCenter={defaultCenter}
                    defaultZoom={7}
                    gestureHandling={'greedy'}
                    disableDefaultUI={false}
                    mapId="bf50a9134105421" // Replace with your actual map ID if using Advanced markers
                >
                    {leagues.map((league) => {
                        if (league.latitude && league.longitude) {
                            return (
                                <Marker
                                    key={league.leagueId}
                                    position={{ lat: league.latitude, lng: league.longitude }}
                                    onClick={() => handleMarkerClick(league)}
                                    ref={league.leagueId === selectedLeagueId ? markerRef : null}
                                />
                            );
                        }
                        return null;
                    })}

                    {infoWindowOpen && selectedLeague && (
                        <InfoWindow
                            anchor={marker}
                            onCloseClick={() => setInfoWindowOpen(false)}
                        >
                            <div className={styles.infoWindow}>
                                <h3>{selectedLeague.name}</h3>
                                {selectedLeague.location && <p>{selectedLeague.location}</p>}
                                {selectedLeague.website && (
                                    <a href={selectedLeague.website} target="_blank" rel="noopener noreferrer">
                                        Website
                                    </a>
                                )}
                            </div>
                        </InfoWindow>
                    )}
                </Map>
            </div>
        </APIProvider>
    );
};

export default LeagueMap;
