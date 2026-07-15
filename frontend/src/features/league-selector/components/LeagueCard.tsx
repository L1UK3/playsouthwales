/* Hallmark · pre-emit critique: P5 H5 E5 S4 R5 V4 */
/* Hallmark · component: card · genre: modern-minimal · theme: custom (design.md)
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (46–50)
 */
import React from 'react';

import type { League } from '@/types/League';

export interface LeagueCardProps {
    key: number; // We keep key for signature compatibility, though React consumes it.
    league: League;
    selectedLeagueID: number | null;
    onLeagueSelect: (id: number) => void;
    onEdit?: (league: League) => void;
    onDelete?: (league: League) => void;
    showInfo?: boolean;
    className?: string;
    state?:
        | 'default'
        | 'hover'
        | 'focus'
        | 'active'
        | 'disabled'
        | 'loading'
        | 'error'
        | 'success';
}

/**
 * LeagueCard component displays individual league information.
 * Redesigned with a soft tone, proper keyboard accessibility, and 8-state support.
 */
const LeagueCard: React.FC<LeagueCardProps> = ({
    league,
    selectedLeagueID,
    onLeagueSelect,
    onEdit,
    onDelete,
    showInfo = true,
    className = '',
    state,
}) => {
    const isSelected = selectedLeagueID === league.leagueId;
    const brandColor = league.brandColor ?? 'var(--color-primary)';
    const isChampionship = league.isChampionshipSeries ?? false;

    // Resolve states
    const isHover = state === 'hover';
    const isFocus = state === 'focus';
    const isActive = state === 'active';
    const isDisabled = state === 'disabled';
    const isLoading = state === 'loading';
    const isError = state === 'error';
    const isSuccess = state === 'success';

    // Keyboard press handler for select
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onLeagueSelect(league.leagueId);
        }
    };

    // Loading state (Skeleton card)
    if (isLoading) {
        return (
            <div className="flex flex-col gap-3.5 p-4 rounded-xl border border-border-color/40 bg-bg-card shadow-sm animate-pulse w-full">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-bg-main shrink-0" />
                    <div className="h-4 w-32 bg-bg-main rounded" />
                </div>
                <div className="h-3.5 w-full bg-bg-main rounded mt-1" />
                <div className="h-3.5 w-5/6 bg-bg-main rounded" />
                <div className="flex gap-2 mt-2">
                    <div className="h-8 w-24 bg-bg-main rounded-md" />
                    <div className="h-8 w-24 bg-bg-main rounded-md" />
                </div>
            </div>
        );
    }

    // Error state card
    if (isError) {
        return (
            <div className="flex flex-col gap-2 p-4 rounded-xl border-2 border-red-500/20 bg-red-500/[0.01] shadow-sm w-full">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs">
                    <span>⚠️</span>
                    <span>Failed to load league</span>
                </div>
            </div>
        );
    }

    // Success state border adjustment
    const successBorder = isSuccess
        ? 'border-2 border-emerald-500/30 bg-emerald-50'
        : '';

    // Championship series styles
    const champStyles = isChampionship
        ? 'border-2 border-amber-500 bg-linear-to-br from-amber-500 to-amber-600 text-white shadow-sm'
        : 'border-2 border-(--store-color) bg-bg-card text-text-main shadow-[0_0_8px_color-mix(in_oklch,var(--store-color)_15%,transparent)]';

    // Selected styles
    const selectionStyles = isSelected
        ? 'bg-(--store-color)/12! ring-2 ring-focus ring-offset-1 scale-[1.01] shadow-md shadow-(--store-color)/5'
        : 'opacity-85 hover:opacity-100';

    // Combine class styling
    const cardClasses = `
        flex flex-col gap-3 p-4 rounded-xl transition-all duration-200 outline-hidden cursor-pointer
        ${champStyles}
        ${selectionStyles}
        ${successBorder}
        ${isHover ? '-translate-y-0.5 shadow-md bg-bg-card-hover border-(--store-color) shadow-[0_0_12px_color-mix(in_oklch,var(--store-color)_30%,transparent)]' : 'hover:-translate-y-0.5 hover:shadow-md hover:bg-bg-card-hover'}
        ${isFocus ? 'ring-2 ring-focus ring-offset-2' : ''}
        ${isActive ? 'scale-[0.99] translate-y-px' : 'active:scale-[0.99] active:translate-y-px'}
        ${isDisabled ? 'opacity-40 pointer-events-none cursor-not-allowed' : ''}
        ${className}
    `
        .trim()
        .replace(/\s+/g, ' ');

    return (
        <div
            id={`league-card-${league.leagueId}`}
            role="button"
            tabIndex={isDisabled ? -1 : 0}
            className={cardClasses}
            style={{ '--store-color': brandColor } as React.CSSProperties}
            onClick={() => onLeagueSelect(league.leagueId)}
            onKeyDown={handleKeyDown}
        >
            <div className="flex items-center gap-3">
                {/* Logo */}
                {league.logo ? (
                    <img
                        src={league.logo}
                        alt={league.name}
                        width="32"
                        height="32"
                        loading="lazy"
                        decoding="async"
                        className="size-8 rounded-lg object-contain bg-white border border-border-color shrink-0 p-1"
                    />
                ) : (
                    <div className="size-8 rounded-lg bg-bg-main border border-border-color shrink-0 flex items-center justify-center text-xs font-bold text-text-muted">
                        {league.name.charAt(0)}
                    </div>
                )}

                {/* Title and Championship Indicator */}
                <div className="flex flex-col gap-0.5 grow min-w-0">
                    <h3 className="text-sm font-bold text-text-darker truncate flex items-center gap-1.5 leading-snug">
                        {isChampionship && (
                            <span className="text-amber-500 text-xs shrink-0">
                                🏆
                            </span>
                        )}
                        <span className="truncate">{league.name}</span>
                    </h3>
                </div>
            </div>

            {/* Info details (No nested cards) */}
            {showInfo && (
                <div className="flex flex-col gap-2.5 mt-0.5">
                    {league.location && (
                        <div className="text-xs text-text-muted pl-3 border-l-2 border-border-color/80 flex flex-col gap-0.5">
                            <span className="font-semibold text-text-main">
                                Location
                            </span>
                            <span className="leading-relaxed">
                                {league.location}
                            </span>
                        </div>
                    )}
                    {league.directions && (
                        <div className="text-xs text-text-muted pl-3 border-l-2 border-border-color/80 flex flex-col gap-0.5">
                            <span className="font-semibold text-text-main">
                                Directions
                            </span>
                            <span className="leading-relaxed">
                                {league.directions}
                            </span>
                        </div>
                    )}
                    {league.accessibility && (
                        <div className="text-xs text-text-muted pl-3 border-l-2 border-border-color/80 flex flex-col gap-0.5">
                            <span className="font-semibold text-text-main">
                                Accessibility
                            </span>
                            <span className="leading-relaxed">
                                {league.accessibility}
                            </span>
                        </div>
                    )}

                    {/* External Website & Event Links */}
                    {(league.website || league.eventLink) && (
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
            )}

            {/* Admin Controls */}
            {(onEdit || onDelete) && (
                <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-border-color/30">
                    {onEdit && (
                        <button
                            type="button"
                            className="btn btn-secondary text-xs py-1.5 px-3"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(league);
                            }}
                        >
                            Edit
                        </button>
                    )}
                    {onDelete && !isChampionship && (
                        <button
                            type="button"
                            className="btn btn-secondary text-xs py-1.5 px-3 border-red-500! text-red-600! dark:text-red-400! bg-red-500/5! hover:bg-red-500/10!"
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
