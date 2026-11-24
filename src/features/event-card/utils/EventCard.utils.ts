// Shared utilities for EventCard components

import { isDateMarkerType, isOfficialEvent } from "#/lib/event-types";
import { cn } from "#/lib/utils";
import type { League, ScheduleEvent } from "#/types/domain";
import type { EventCardAdditionalProps } from "../types/EventCard.types";
import { getEventDescription } from "./getEventDescription";

/**
 * Extract league information and computed store color.
 * @param event {Event} - The event object containing event details.
 * @param leagueMap {Record<number, League>} - A mapping of league IDs to League objects.
 * @returns {{ league: League | null, leagueName: string }} - An object containing the league and its name.
 */
export function getLeagueInfo(
	event: ScheduleEvent,
	leagueMap: Record<number, League>,
): { league: League | null; leagueName: string } {
	const league =
		event.leagueId && event.leagueId !== -1 ? leagueMap[event.leagueId] : null;
	const leagueName = league?.name ?? event.leagueName ?? "Unknown League";
	return { league, leagueName };
}

/**
 * Compute the store color for an event based on its type and associated league.
 * @param event {Event} - The event object containing event details.
 * @param league {League | null} - The league object associated with the event, or null if not applicable.
 * @returns {string} - The computed store color as a CSS variable or HSL value.
 */
export function getStoreColor(
	event: ScheduleEvent,
	league: League | null,
): string {
	return isDateMarkerType(event.eventType)
		? "var(--color-special-day-border)"
		: (league?.brandColor ??
				`hsl(${((event.leagueId ?? 0) * 137) % 360}, 65%, 55%)`);
}

/**
 * Resolve forced visual state flags.
 * @param state {EventCardAdditionalProps['state']} - The current state of the card.
 * @returns {stateFlags} - An object containing flags for each state.
 */
export function getStateFlags(state: EventCardAdditionalProps["state"]) {
	return {
		isHover: state === "hover",
		isFocus: state === "focus",
		isActive: state === "active",
		isDisabled: state === "disabled",
		isLoading: state === "loading",
		isError: state === "error",
		isSuccess: state === "success",
	};
}

/** Display label for the game(s) an event is for. */
export function getGameLabel(game: string): string {
	return game === "ALL" ? "TCG, VGC, GO" : game;
}

/**
 * Everything a card variant needs to know about an event, independent of
 * how the variant lays it out.
 */
export interface EventCardView {
	league: League | null;
	leagueName: string;
	storeColor: string;
	isChampionship: boolean;
	isOfficial: boolean;
	isDateMarker: boolean;
	description: string;
	gameLabel: string;
	/** Tier theme classes (gold / silver / purple / default border). */
	themeClasses: string;
}

/** Resolve an event and its league into the card view shared by all variants. */
export function describeEventCard(
	event: ScheduleEvent,
	leagueMap: Record<number, League>,
): EventCardView {
	const { league, leagueName } = getLeagueInfo(event, leagueMap);
	const isChampionship = league?.isChampionshipSeries ?? false;
	return {
		league,
		leagueName,
		storeColor: getStoreColor(event, league),
		isChampionship,
		isOfficial: isOfficialEvent(event.eventType, isChampionship),
		isDateMarker: isDateMarkerType(event.eventType),
		description: getEventDescription(event),
		gameLabel: getGameLabel(event.game),
		themeClasses: getCardStyles(event.eventType, isChampionship),
	};
}

/** Format plain GBP amounts while preserving descriptive entry fees. */
export function getEntryFeeLabel(entryFee?: string | null): string {
	const raw = entryFee?.trim();
	if (!entryFee || !raw) return "£0.00";

	// Fees are free text: do not reinterpret ranges, other currencies or notes.
	const match = /^(?:£\s*)?(\d+(?:\.\d{1,2})?)$/.exec(raw);
	if (!match) return entryFee;

	const amount = Number(match[1]);
	return Number.isFinite(amount) && amount < 1e21
		? `£${amount.toFixed(2)}`
		: entryFee;
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
	const isCup = eventType === "CUP";
	const isChallenge = eventType === "CHALLENGE";
	const isPrerelease = eventType === "PRE-RELEASE";

	let theme: "gold" | "silver" | "purple" | "default" = "default";
	if (isChampionship || isCup) {
		theme = "gold";
	} else if (isChallenge) {
		theme = "silver";
	} else if (isPrerelease) {
		theme = "purple";
	}

	switch (theme) {
		case "gold":
			return cn(
				"border-2 border-(--store-color) bg-linear-to-br from-yellow-600/[0.5]",
				"to-transparent shadow-md shadow-amber-500/5",
			);
		case "silver":
			return cn(
				"border-2 border-(--store-color) bg-linear-to-br from-slate-500/[0.5]",
				"to-transparent shadow-md shadow-slate-400/5 text-white",
			);
		case "purple":
			return cn(
				"border-2 border-(--store-color) bg-linear-to-br from-purple-600/[0.5]",
				"to-transparent shadow-md shadow-purple-500/5 text-white",
			);
		default:
			return cn(
				"border-2 border-(--store-color) bg-solid-gold",
				"shadow-[0_0_8px_color-mix(in_oklch,var(--store-color)_15%,transparent)]",
			);
	}
}
