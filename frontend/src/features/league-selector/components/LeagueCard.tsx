import React from 'react';

import type { League } from '@/types/League';

/**
 * @interface LeagueCardProps
 * @description Properties for the LeagueCard component.
 * @property {number} key - Unique identifier for the component instance.
 * @property {League} league - The league object containing details to display.
 * @property {number | null} selectedLeagueID - The ID of the currently selected league.
 * @property {(id: number) => void} onLeagueSelect - Callback function triggered when a league is selected.
 */
export interface LeagueCardProps {
    key: number;
    league: League;
    selectedLeagueID: number | null;
    onLeagueSelect: (id: number) => void;
    onEdit?: (league: League) => void;
    onDelete?: (league: League) => void;
    showInfo?: boolean;
    className?: string;
}

/**
 * LeagueCard component displays individual league information.
 * @param props - The properties for the LeagueCard component.
 * @returns JSX.Element
 */
const LeagueCard: React.FC<LeagueCardProps> = ({
    league,
    selectedLeagueID,
    onLeagueSelect,
    onEdit,
    onDelete,
    showInfo = true,
    className = ''
}) => {
    const isSelected = selectedLeagueID === league.leagueId;
    const brandColor = league.brandColor ?? 'var(--color-primary)';

    return (
        <div
            id={`league-card-${league.leagueId}`}
            className={`flex flex-col gap-2 p-4 rounded-lg border-2 border-border-color border-l-4 border-l-[var(--brand-color)] bg-bg-card cursor-pointer transition-all duration-200 hover:bg-bg-card-hover hover:-translate-y-px hover:border-[color-mix(in_oklch,var(--brand-color)_40%,var(--color-border-color))] ${isSelected ? "border-[var(--brand-color)]! bg-[color-mix(in_oklch,var(--brand-color)_8%,transparent)]! shadow-[0_4px_12px_color-mix(in_oklch,var(--brand-color)_15%,transparent)]!" : ""} ${className}`}
            style={{ '--brand-color': brandColor } as React.CSSProperties}
            onClick={() => onLeagueSelect(league.leagueId)}
        >
            <div className="flex items-center gap-2.5 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-text-darker">
                {league.logo && <img src={league.logo} alt={league.name} className="w-8 h-8 rounded-md object-contain bg-white border border-border-color p-px shrink-0" />}
                <h3>{league.name}</h3>
            </div>
            {showInfo && (
                <>
                    {league.location && <p className="text-[13px] text-text-muted">📍 {league.location}</p>}
                    <div className="flex gap-2 flex-wrap">
                        {league.website && (
                            <a
                                href={league.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                                onClick={(e) => e.stopPropagation()}
                            >
                                League Website
                            </a>
                        )}
                        {league.pokemonLink && (
                            <a
                                href={league.pokemonLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Pokémon Website
                            </a>
                        )}
                    </div>
                </>
            )}
            {(onEdit ?? onDelete) && (
                <div className="flex gap-2 flex-wrap">
                    {onEdit && (
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(league);
                            }}
                        >
                            Edit
                        </button>
                    )}
                    {onDelete && (
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(league);
                            }}
                        >
                            Delete
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default LeagueCard;
