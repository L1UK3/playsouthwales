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

const rankOf = (eventType: string) =>
	TYPE_RANK[eventType.toUpperCase()] ?? UNKNOWN_TYPE_RANK;

export function sortEventsForSchedule(
	events: ScheduleEvent[],
): ScheduleEvent[] {
	return [...events].sort(
		(a, b) =>
			a.date.localeCompare(b.date) ||
			rankOf(a.eventType) - rankOf(b.eventType) ||
			(a.startTime ?? "").localeCompare(b.startTime ?? ""),
	);
}
