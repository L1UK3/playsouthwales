import { useMemo } from 'react';
import type { Event } from '@/types/Event';
import type { League } from '@/types/League';
import {
    getLeagueInfo,
    getStoreColor,
    getStateFlags,
    getCardStyles,
} from '../utils/EventCard.utils';
import type { EventCardAdditionalProps } from '../types/EventCard.types';
import {
    CARD_BASE_CLASSES,
    FOCUS_RING_CLASSES,
    ACTIVE_STATE_CLASSES,
    INACTIVE_ACTIVE_CLASSES,
    HOVER_TRANSITION_CLASSES,
    INACTIVE_HOVER_CLASSES,
} from '../constants/EventCard.constants';

/**
 * Custom React hook that resolves and memoizes event card metadata, store colors,
 * interactive state flags, and computed CSS classes based on Vercel's React best practices.
 */
export function useEventCard(
    event: Event,
    leagueMap: Record<number, League>,
    state?: EventCardAdditionalProps['state'],
    cardType?: 'list' | 'schedule' | 'calendar'
) {
    return useMemo(() => {
        const { league, leagueName } = getLeagueInfo(event, leagueMap);
        const storeColor = getStoreColor(event, league);
        const isChampionship = league?.isChampionshipSeries ?? false;

        const stateFlags = getStateFlags(state, event);
        const cardStyles = cardType
            ? getCardStyles(event.eventType, isChampionship, cardType)
            : '';

        const successBorder = stateFlags.isSuccess
            ? 'border-2 border-emerald-500/30 bg-emerald-500/[0.01]'
            : '';

        const isOfficial =
            event.eventType === 'CUP' ||
            event.eventType === 'CHALLENGE' ||
            event.eventType === 'PRE-RELEASE' ||
            isChampionship;

        let cardClasses = '';
        if (cardType === 'list') {
            const isStateDisabled = stateFlags.isDisabled;
            const isDisabled = isStateDisabled || event.isExcluded;
            const isHover = stateFlags.isHover;
            const isFocus = stateFlags.isFocus;
            const isActive = stateFlags.isActive;

            cardClasses = `
                rounded-xl overflow-hidden cursor-pointer ${CARD_BASE_CLASSES}
                ${cardStyles}
                ${successBorder}
                ${isHover ? `${HOVER_TRANSITION_CLASSES} translate-x-0.5` : `${INACTIVE_HOVER_CLASSES} hover:translate-x-0.5`}
                ${isFocus ? FOCUS_RING_CLASSES : ''}
                ${isActive ? ACTIVE_STATE_CLASSES : INACTIVE_ACTIVE_CLASSES}
                ${event.isExcluded ? 'opacity-55 grayscale-[30%] border-dashed border-red-500/20' : ''}
                ${isDisabled && state === 'disabled' ? 'opacity-40 pointer-events-none cursor-not-allowed' : ''}
            `
                .trim()
                .replace(/\s+/g, ' ');
        } else if (cardType === 'schedule') {
            const isDisabled = stateFlags.isDisabled;
            const isHover = stateFlags.isHover;
            const isFocus = stateFlags.isFocus;
            const isActive = stateFlags.isActive;
            const isReleaseCard = stateFlags.isReleaseCard;

            cardClasses = `
                flex flex-col gap-3 p-4 rounded-xl ${CARD_BASE_CLASSES}
                ${cardStyles}
                ${successBorder}
                ${isHover ? HOVER_TRANSITION_CLASSES : INACTIVE_HOVER_CLASSES}
                ${isFocus ? FOCUS_RING_CLASSES : ''}
                ${isActive ? ACTIVE_STATE_CLASSES : INACTIVE_ACTIVE_CLASSES}
                ${isDisabled ? 'opacity-55 pointer-events-none cursor-not-allowed' : ''}
                ${isReleaseCard ? 'bg-bg-card-release border-2 border-black shadow-[0_0_8px_rgba(0,0,0,0.15)]' : ''}
            `
                .trim()
                .replace(/\s+/g, ' ');
        } else if (cardType === 'calendar') {
            cardClasses = cardStyles;
        }

        return {
            league,
            leagueName,
            storeColor,
            isChampionship,
            stateFlags,
            cardClasses,
            isOfficial,
        };
    }, [event, leagueMap, state, cardType]);
}
