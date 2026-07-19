// Shared utilities for EventCard components

import type { Event } from '@/types/Event';
import type { League } from '@/types/League';
import type { EventCardAdditionalProps } from '../types/EventCard.types';

/**
 * Extract league information and computed store color.
 */
export function getLeagueInfo(event: Event, leagueMap: Record<number, League>) {
    const league =
        event.leagueId && event.leagueId !== -1
            ? leagueMap[event.leagueId]
            : null;
    const leagueName =
        event.eventType === 'LEGALITY'
            ? 'Standard TCG Legality'
            : (league?.name ?? event.leagueName ?? 'Unknown League');
    return { league, leagueName };
}

export function getStoreColor(event: Event, league: League | null): string {
    return event.eventType === 'LEGALITY'
        ? 'var(--color-secondary)'
        : (league?.brandColor ??
              `hsl(${((event.leagueId ?? 0) * 137) % 360}, 65%, 55%)`);
}

/**
 * Resolve component state flags.
 */
export function getStateFlags(
    state: EventCardAdditionalProps['state'],
    event: Event
) {
    return {
        isHover: state === 'hover',
        isFocus: state === 'focus',
        isActive: state === 'active',
        isDisabled: state === 'disabled',
        isLoading: state === 'loading',
        isError: state === 'error',
        isSuccess: state === 'success',
        isReleaseCard:
            event.eventType === 'RELEASE' || event.eventType === 'LEGALITY',
    };
}

/**
 * Resolves Tailwind styling classes for a card based on event characteristics.
 */
export function getCardStyles(
    eventType: string,
    isChampionship: boolean,
    cardType: 'list' | 'schedule' | 'calendar'
): string {
    const isCup = eventType === 'CUP';
    const isChallenge = eventType === 'CHALLENGE';
    const isPrerelease = eventType === 'PRE-RELEASE';

    if (cardType === 'list') {
        if (isChampionship) {
            return 'border-2 border-amber-500 bg-linear-to-br from-amber-500 to-amber-600 text-white shadow-sm';
        }
        if (isCup) {
            return 'border-2 border-slate-400 bg-linear-to-br from-slate-400 to-slate-500 text-white shadow-sm';
        }
        if (isChallenge) {
            return 'border-2 border-amber-700 bg-linear-to-br from-amber-700 to-amber-800 text-white shadow-sm';
        }
        if (isPrerelease) {
            return 'border-2 border-purple-500 bg-linear-to-br from-purple-500 to-purple-600 text-white shadow-sm';
        }
        return 'border-2 border-(--store-color) bg-bg-card text-text-main shadow-[0_0_8px_color-mix(in_oklch,var(--store-color)_15%,transparent)]';
    } else {
        if (isChampionship) {
            return 'border-2 border-amber-500/40 bg-linear-to-br from-yellow-600/[0.5] to-transparent shadow-md shadow-amber-500/5';
        }
        if (isCup) {
            return 'border-2 border-slate-400/40 bg-linear-to-br from-slate-500/[0.5] to-transparent shadow-md shadow-slate-400/5 text-white';
        }
        if (isChallenge) {
            return 'border-2 border-amber-700/40 bg-linear-to-br from-amber-800/[0.5] to-transparent shadow-md shadow-amber-700/5 text-white';
        }
        if (isPrerelease) {
            return 'border-2 border-purple-500/40 bg-linear-to-br from-purple-600/[0.5] to-transparent shadow-md shadow-purple-500/5 text-white';
        }
        return 'border-2 border-(--store-color) bg-solid-gold shadow-[0_0_8px_color-mix(in_oklch,var(--store-color)_15%,transparent)]';
    }
}
