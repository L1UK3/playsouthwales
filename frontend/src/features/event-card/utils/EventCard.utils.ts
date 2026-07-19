// Shared utilities for EventCard components

import type { Event } from '@/types/Event';
import type { League } from '@/types/League';
import type { EventCardAdditionalProps } from '../types/EventCard.types';

/**
 * Extract league information and computed store color.
 * @param event {Event} - The event object containing event details.
 * @param leagueMap {Record<number, League>} - A mapping of league IDs to League objects.
 * @returns {{ league: League | null, leagueName: string }} - An object containing the league and its name.
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

/**
 * Compute the store color for an event based on its type and associated league.
 * @param event {Event} - The event object containing event details.
 * @param league {League | null} - The league object associated with the event, or null if not applicable.
 * @returns {string} - The computed store color as a CSS variable or HSL value.
 */
export function getStoreColor(event: Event, league: League | null): string {
    return event.eventType === 'LEGALITY'
        ? 'var(--color-secondary)'
        : (league?.brandColor ??
            `hsl(${((event.leagueId ?? 0) * 137) % 360}, 65%, 55%)`);
}

/**
 * Resolve component state flags.
 * @param state {EventCardAdditionalProps['state']} - The current state of the card.
 * @param event {Event} - The event object containing event details.
 * @returns {stateFlags} - An object containing flags for each state.
 */
export function getStateFlags(
    state: EventCardAdditionalProps['state'],
    event: Event
) {
    const stateFlags = {
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
    return stateFlags;
}

/**
 * Resolves Tailwind styling classes for a card based on event characteristics.
 * @param eventType {string} - The type of the event.
 * @param isChampionship {boolean} - Whether the event is a championship.
 * @returns {string} - The Tailwind styling classes for the card.
 */
export function getCardStyles(
    eventType: string,
    isChampionship: boolean,
): string {
    const isCup = eventType === 'CUP';
    const isChallenge = eventType === 'CHALLENGE';
    const isPrerelease = eventType === 'PRE-RELEASE';

    let theme: 'gold' | 'silver' | 'purple' | 'default' = 'default';
    if (isChampionship) {
        theme = 'gold';
    } else if (isChallenge || isCup) {
        theme = 'silver';
    } else if (isPrerelease) {
        theme = 'purple';
    }

    switch (theme) {
        case 'gold':
            return 'border-2 border-(--store-color) bg-linear-to-br from-yellow-600/[0.5] to-transparent shadow-md shadow-amber-500/5';
        case 'silver':
            return 'border-2 border-(--store-color) bg-linear-to-br from-slate-500/[0.5] to-transparent shadow-md shadow-slate-400/5 text-white';
        case 'purple':
            return 'border-2 border-(--store-color) bg-linear-to-br from-purple-600/[0.5] to-transparent shadow-md shadow-purple-500/5 text-white';
        default:
            return 'border-2 border-(--store-color) bg-solid-gold shadow-[0_0_8px_color-mix(in_oklch,var(--store-color)_15%,transparent)]';
    }
}
