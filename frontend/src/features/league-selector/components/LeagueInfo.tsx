import React from 'react';

import type { League } from '@/types/League';

interface LeagueInfoProps {
    league: League;
}

/**
 * LeagueInfo lists a league's location, directions, accessibility notes, and
 * external links. LeagueCard and the mobile map sheet both use it.
 */
export const LeagueInfo: React.FC<LeagueInfoProps> = ({ league }) => (
    <div className="flex flex-col gap-2.5 mt-0.5">
        {league.location && (
            <div className="text-xs text-text-muted pl-3 border-l-2 border-border-color/80 flex flex-col gap-0.5">
                <span className="font-semibold text-text-main">Location</span>
                <span className="leading-relaxed">{league.location}</span>
            </div>
        )}
        {league.directions && (
            <div className="text-xs text-text-muted pl-3 border-l-2 border-border-color/80 flex flex-col gap-0.5">
                <span className="font-semibold text-text-main">Directions</span>
                <span className="leading-relaxed">{league.directions}</span>
            </div>
        )}
        {league.accessibility && (
            <div className="text-xs text-text-muted pl-3 border-l-2 border-border-color/80 flex flex-col gap-0.5">
                <span className="font-semibold text-text-main">
                    Accessibility
                </span>
                <span className="leading-relaxed">{league.accessibility}</span>
            </div>
        )}

        {/* External Website & Event Links */}
        {(league.website ?? league.eventLink) && (
            <div className="flex flex-wrap gap-2 mt-1">
                {league.website && (
                    <a
                        href={league.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary text-xs py-1.5 px-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        League Website
                    </a>
                )}
                {league.eventLink && (
                    <a
                        href={league.eventLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary text-xs py-1.5 px-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Event Page
                    </a>
                )}
            </div>
        )}
    </div>
);

export default LeagueInfo;
