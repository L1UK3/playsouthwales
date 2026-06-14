import { useCallback, useMemo } from 'react';
import type { League } from '@/types/League';
import { getSelectedLeague, mapLeaguesToMarkers } from '@map/helper';

interface UseMarkerProps {
    leagues: League[];
    selectedLeagueId: number | null;
    onLeagueSelect: (id: number | null) => void;
}

/**
 * Custom React hook coordinating map marker states, selection tracking, and event delegation.
 */
export function useMarker({ leagues, selectedLeagueId, onLeagueSelect }: UseMarkerProps) {
    const markers = useMemo(() => mapLeaguesToMarkers(leagues), [leagues]);
    const selectedLeague = useMemo(() => getSelectedLeague(leagues, selectedLeagueId), [leagues, selectedLeagueId]);

    const handleMarkerClick = useCallback((id: number, domEvent?: { stopPropagation: () => void }) => {
        if (domEvent) {
            domEvent.stopPropagation();
        }
        onLeagueSelect(id);
    }, [onLeagueSelect]);

    const handleMapClick = useCallback(() => {
        onLeagueSelect(null);
    }, [onLeagueSelect]);

    const handleCloseInfoWindow = useCallback(() => {
        onLeagueSelect(null);
    }, [onLeagueSelect]);

    return {
        markers,
        selectedLeague,
        handleMarkerClick,
        handleMapClick,
        handleCloseInfoWindow,
    };
}

export default useMarker;
