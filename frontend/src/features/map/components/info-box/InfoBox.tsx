import React from 'react';
import { InfoWindow } from '@vis.gl/react-google-maps';
import type { League } from '@/types/League';
import styles from './InfoBox.module.css';

interface InfoBoxProps {
    selectedLeague: League;
    onCloseClick: () => void;
}

/**
 * InfoBox renders the Google Map InfoWindow popup card detailing a selected league,
 * styling links and actions with the league's brand color.
 */
export const InfoBox: React.FC<InfoBoxProps> = ({ selectedLeague, onCloseClick }) => {
    if (
        selectedLeague.latitude === undefined ||
        selectedLeague.longitude === undefined ||
        selectedLeague.latitude === null ||
        selectedLeague.longitude === null
    ) {
        return null;
    }

    const brandColor = selectedLeague.brandColor ?? '#e31d23';

    return (
        <InfoWindow
            position={{ lat: selectedLeague.latitude, lng: selectedLeague.longitude }}
            onCloseClick={onCloseClick}
        >
            <div
                className={styles.infoWindow}
                style={{ '--brand-color': brandColor } as React.CSSProperties}
            >
                <div className={styles.infoWindowHeader}>
                    {selectedLeague.logo && (
                        <img
                            src={selectedLeague.logo}
                            alt={`${selectedLeague.name} Logo`}
                            className={styles.infoWindowLogo}
                        />
                    )}
                    <h3 className={styles.infoWindowTitle}>{selectedLeague.name}</h3>
                </div>
                {selectedLeague.location && (
                    <p className={styles.infoWindowLocation}>
                        📍 {selectedLeague.location}
                    </p>
                )}
                <div className={styles.infoWindowActions}>
                    {selectedLeague.website && (
                        <a
                            href={selectedLeague.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.infoWindowLink}
                        >
                            Website
                        </a>
                    )}
                    {selectedLeague.pokemonLink && (
                        <a
                            href={selectedLeague.pokemonLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.infoWindowLink}
                        >
                            Pokémon Events
                        </a>
                    )}
                </div>
            </div>
        </InfoWindow>
    );
};

export default InfoBox;
