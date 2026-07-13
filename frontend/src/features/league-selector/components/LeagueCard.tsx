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
    className = '',
}) => {
    const isSelected = selectedLeagueID === league.leagueId;
    const brandColor = league.brandColor ?? 'var(--color-primary)';
    const isChampionship = league.isChampionshipSeries ?? false;

    return (
        <div
            id={`league-card-${league.leagueId}`}
            className={`flex flex-col gap-2 p-4 cursor-pointer transition-[border-color,transform,box-shadow] duration-150 ease-out hover:-translate-y-px calendar-card bg-bg-card hover:bg-bg-card-hover hover:border-(--store-color)/40 ${isSelected ? 'border-(--store-color)! bg-(--store-color)/8! shadow-lg shadow-(--store-color)/15!' : ''} ${isChampionship ? 'border-2 border-amber-500/50! bg-linear-to-br from-amber-500/10 to-transparent!' : ''} ${className}`}
            style={{ '--store-color': brandColor } as React.CSSProperties}
            onClick={() => onLeagueSelect(league.leagueId)}
        >
            <div className="flex items-center gap-2.5 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-text-darker">
                {league.logo && (
                    <img
                        src={league.logo}
                        alt={league.name}
                        width="32"
                        height="32"
                        loading="lazy"
                        decoding="async"
                        className="size-8 rounded-md object-contain bg-white border border-border-color p-px shrink-0"
                    />
                )}
                <h3>{league.name}</h3>
            </div>
            {showInfo && (
                <>
                    {league.location ? (
                        <div
                            className={
                                'text-xs bg-white/5 p-2 rounded-lg flex flex-col gap-0.5 border border-border-color/30'
                            }
                        >
                            <div className="font-semibold text-text-main flex items-center gap-1">
                                📍 Location
                            </div>
                            <div className="leading-relaxed">
                                {league.location}
                            </div>
                        </div>
                    ) : null}
                    {league?.directions ? (
                        <div
                            className={
                                'text-xs bg-white/5 p-2 rounded-lg flex flex-col gap-0.5 border border-border-color/30'
                            }
                        >
                            <div className="font-semibold text-text-main flex items-center gap-1">
                                📍 Directions
                            </div>
                            <div className="leading-relaxed">
                                {league.directions}
                            </div>
                        </div>
                    ) : null}
                    {league?.accessibility ? (
                        <div
                            className={
                                'text-xs bg-white/5 p-2 rounded-lg flex flex-col gap-0.5 border border-border-color/30'
                            }
                        >
                            <div className="font-semibold text-text-main flex items-center gap-1">
                                ♿ Accessibility
                            </div>
                            <div className="leading-relaxed">
                                {league.accessibility}
                            </div>
                        </div>
                    ) : null}

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
                        {league.eventLink && (
                            <a
                                href={league.eventLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Event Page
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
                    {/* Championship series leagues cannot be deleted — they are permanent */}
                    {onDelete && !isChampionship && (
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
