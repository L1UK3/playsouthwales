/* Hallmark · component: map marker · genre: modern-minimal · theme: custom (design.md) */
import React from 'react';
import type { MarkerData } from '@map/types/markerData';

/**
 * Height in pixels of a selected marker: a 36px badge plus an 8px tail, scaled
 * 1.25x, with a small gap. The info window uses it to sit above the marker.
 * Keep it in sync with the size-9, border-t-8, and scale-125 classes below.
 */
export const SELECTED_MARKER_HEIGHT = 58;

interface LeagueMarkerProps {
    marker: MarkerData;
    isSelected: boolean;
}

/**
 * Builds up to two initials from a league name, for leagues without a logo.
 */
function getInitials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join('');
}

/**
 * LeagueMarker renders a branded map pin: the league logo inside a ring of its
 * brand colour, with a tail that points at the venue. The selected marker grows
 * and gains a soft halo in the same colour.
 */
export const LeagueMarker: React.FC<LeagueMarkerProps> = ({
    marker,
    isSelected,
}) => (
    <div
        className={`flex origin-bottom flex-col items-center drop-shadow-md transition-transform duration-150 ease-out motion-reduce:transition-none ${
            isSelected ? 'scale-125' : 'hover:scale-110'
        }`}
        style={{ '--brand-color': marker.brandColor } as React.CSSProperties}
    >
        <div
            className={`flex size-9 items-center justify-center overflow-hidden rounded-full border-[3px] border-(--brand-color) bg-white transition-shadow duration-150 ease-out motion-reduce:transition-none ${
                isSelected ? 'ring-4 ring-(--brand-color)/35' : ''
            }`}
        >
            {marker.logo ? (
                <img
                    src={marker.logo}
                    alt=""
                    width="30"
                    height="30"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="size-full object-contain p-0.5"
                />
            ) : (
                <span className="text-[11px] font-extrabold tracking-tight text-[color-mix(in_oklch,var(--brand-color)_70%,black)]">
                    {getInitials(marker.name)}
                </span>
            )}
        </div>
        <span
            aria-hidden="true"
            className="-mt-px h-0 w-0 border-x-[6px] border-t-8 border-x-transparent border-t-(--brand-color)"
        />
    </div>
);

export default LeagueMarker;
