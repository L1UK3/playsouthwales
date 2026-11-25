import { eventDateKey } from "#/lib/month";
import type { EventTypeMap, ScheduleEvent } from "#/types/domain";

export const EVENT_TYPE_LABELS: EventTypeMap = {
	CASUAL: "C",
	STANDARD: "S",
	CHALLENGE: "🏅",
	CUP: "🏆",
	"PRE-RELEASE": "PR",
	SPECIAL: "📍",
	REGIONAL: "📍",
	INTERNATIONAL: "INT",
	WORLDS: "🌍",
	LEGALITY: "LEGAL",
	RELEASE: "NEW SET",
	REGULATION: "VGC REG",
};

const TYPE_RANK: Record<string, number> = {
	LEGALITY: 0,
	RELEASE: 0,
	REGULATION: 0,
	WORLDS: 1,
	INTERNATIONAL: 1,
	REGIONAL: 1,
	SPECIAL: 1,
	CUP: 2,
	CHALLENGE: 3,
	"PRE-RELEASE": 4,
	STANDARD: 5,
	CASUAL: 6,
};
const UNKNOWN_TYPE_RANK = 7;

export const rankOf = (eventType?: string | null) => {
	if (!eventType) return UNKNOWN_TYPE_RANK;
	return TYPE_RANK[eventType.trim().toUpperCase()] ?? UNKNOWN_TYPE_RANK;
};

export function compareEventsForSchedule(
	a: ScheduleEvent,
	b: ScheduleEvent,
): number {
	const dateA = eventDateKey(a);
	const dateB = eventDateKey(b);
	if (dateA !== dateB) {
		return dateA.localeCompare(dateB);
	}
	const rankDiff = rankOf(a.eventType) - rankOf(b.eventType);
	if (rankDiff !== 0) {
		return rankDiff;
	}
	return (a.startTime ?? "").localeCompare(b.startTime ?? "");
}

export function sortEventsForSchedule(
	events: ScheduleEvent[],
): ScheduleEvent[] {
	if (events.length <= 1) return events;
	return [...events].sort(compareEventsForSchedule);
}

/**
 * Date markers are calendar entries for set legality, set release and
 * regulation changes. They belong to no league and are not played.
 */
const DATE_MARKER_TYPES: ReadonlySet<string> = new Set([
	"LEGALITY",
	"RELEASE",
	"REGULATION",
]);

/** Event types run under official Play! Pokémon sanctioning tiers. */
const OFFICIAL_TYPES: ReadonlySet<string> = new Set([
	"CUP",
	"CHALLENGE",
	"PRE-RELEASE",
]);

export const isDateMarkerType = (eventType: string): boolean =>
	DATE_MARKER_TYPES.has(eventType);

/**
 * Official events are League Cups, League Challenges, Prereleases and
 * anything hosted by the Championship Series league.
 */
export const isOfficialEvent = (
	eventType: string,
	isChampionshipSeries = false,
): boolean => isChampionshipSeries || OFFICIAL_TYPES.has(eventType);
