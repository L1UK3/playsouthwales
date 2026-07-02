import React from 'react';
import { InfoWindow } from '@vis.gl/react-google-maps';
import type { League } from '@/types/League';


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
                className="text-[#0f172a] p-1.5 font-sans min-w-50"
                style={{ '--brand-color': brandColor } as React.CSSProperties}
            >
                <div className="flex items-center gap-2 mb-2">
                    {selectedLeague.logo && (
                        <img
                            src={selectedLeague.logo}
                            alt={`${selectedLeague.name} Logo`}
                            className="w-7 h-7 rounded-md object-contain bg-white border border-[#e2e8f0] p-px"
                        />
                    )}
                    <h3 className="m-0 text-[15px] font-bold text-[#0f172a] leading-tight">{selectedLeague.name}</h3>
                </div>
                {selectedLeague.location && (
                    <p className="m-0 mb-2.5 text-[13px] text-[#475569]">
                        📍 {selectedLeague.location}
                    </p>
                )}
                <div className="flex gap-3 border-t border-[#e2e8f0] pt-2 mt-2">
                    {selectedLeague.website && (
                        <a
                            href={selectedLeague.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-xs text-[color-mix(in_srgb,var(--brand-color,#2563eb)_80%,#0f172a)] no-underline font-bold transition-colors duration-200 hover:underline"
                        >
                            Website
                        </a>
                    )}
                    {selectedLeague.eventLink && (
                        <a
                            href={selectedLeague.eventLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-xs text-[color-mix(in_srgb,var(--brand-color,#2563eb)_80%,#0f172a)] no-underline font-bold transition-colors duration-200 hover:underline"
                        >
                            Official Events
                        </a>
                    )}
                </div>
            </div>
        </InfoWindow>
    );
};

export default InfoBox;
