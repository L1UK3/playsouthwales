import { eventDateKey } from "#/lib/month";
import type { ScheduleEvent } from "#/types/domain";

const EVENT_TYPE_LABELS: Record<string, string> = {
	CHALLENGE: "🏅 Challenge",
	CUP: "🏆 Cup",
	"PRE-RELEASE": "🎁 Pre-release",
	SPECIAL: "📍 Special event",
	REGIONAL: "📍 Regional",
	INTERNATIONAL: "🌍 International",
	WORLDS: "🌍 Worlds",
	STANDARD: "⚔️ Standard league",
	CASUAL: "🎲 Casual league",
	LEGALITY: "✅ New TCG set legal",
	RELEASE: "📦 TCG set release day",
	REGULATION: "📜 New VGC regulation legal",
};

/** Digests list by type first, unlike the calendar, which sorts by date. */
const DIGEST_TYPE_ORDER = [
	"CHALLENGE",
	"CUP",
	"PRE-RELEASE",
	"SPECIAL",
	"REGIONAL",
	"INTERNATIONAL",
	"WORLDS",
	"STANDARD",
	"CASUAL",
	"LEGALITY",
	"RELEASE",
	"REGULATION",
];

const UNSANCTIONED_TYPES: ReadonlySet<string> = new Set(["CASUAL", "STANDARD"]);
const CHAMPIONSHIP_TYPES: ReadonlySet<string> = new Set([
	"SPECIAL",
	"REGIONAL",
	"INTERNATIONAL",
	"WORLDS",
]);

export const FOOTER =
	"\n-# Sanctioned events from the official Play Pokemon! schedule and from Pokédata (unofficial); " +
	"Weekly events listed by league partners. <https://playsouthwales.uk/>";

const normalType = (event: ScheduleEvent) =>
	(event.eventType ?? "").trim().toUpperCase();

const digestRank = (event: ScheduleEvent) => {
	const rank = DIGEST_TYPE_ORDER.indexOf(normalType(event));
	return rank === -1 ? DIGEST_TYPE_ORDER.length : rank;
};

function sortForDigest(events: ScheduleEvent[]): ScheduleEvent[] {
	return [...events].sort(
		(a, b) =>
			digestRank(a) - digestRank(b) ||
			eventDateKey(a).localeCompare(eventDateKey(b)) ||
			(a.startTime ?? "").localeCompare(b.startTime ?? ""),
	);
}

const isChampionship = (event: ScheduleEvent) =>
	CHAMPIONSHIP_TYPES.has(normalType(event));

const isSanctioned = (event: ScheduleEvent) =>
	!UNSANCTIONED_TYPES.has(normalType(event));

const titleCase = (text: string) =>
	text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const dayFormat = new Intl.DateTimeFormat("en-GB", {
	timeZone: "UTC",
	weekday: "short",
	day: "numeric",
	month: "short",
});

/** "Thu 29 Oct" for a YYYY-MM-DD key. */
export function formatDay(dateKey: string): string {
	const parts = dayFormat.formatToParts(new Date(`${dateKey}T00:00:00Z`));
	const part = (type: Intl.DateTimeFormatPartTypes) =>
		parts.find((p) => p.type === type)?.value ?? "";
	return `${part("weekday")} ${part("day")} ${part("month")}`;
}

/** The YYYY-MM-DD key `days` after `dateKey`. */
export function addDays(dateKey: string, days: number): string {
	const date = new Date(`${dateKey}T00:00:00Z`);
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().slice(0, 10);
}

/** Monday to Sunday of the week after the one `today` falls in. */
export function nextWeek(today: string): { start: string; end: string } {
	const weekday = new Date(`${today}T00:00:00Z`).getUTCDay();
	const start = addDays(today, weekday === 0 ? 1 : 8 - weekday);
	return { start, end: addDays(start, 6) };
}

function championshipLine(event: ScheduleEvent): string {
	const emoji = EVENT_TYPE_LABELS[normalType(event)].split(" ")[0];
	return `**${emoji} ${event.name}**`;
}

function eventLine(
	event: ScheduleEvent,
	leagues: Record<number, string>,
	showDate: boolean,
): string {
	const type = normalType(event);
	const label = EVENT_TYPE_LABELS[type] ?? (type ? titleCase(type) : "Event");
	const parts = [
		`**${label}**`,
		event.game === "ALL" ? undefined : event.game,
		leagues[event.leagueId],
		showDate ? formatDay(eventDateKey(event)) : undefined,
	];
	return parts.filter(Boolean).join(" · ");
}

/** Championships above the other events, most important first. */
function digestBody(
	events: ScheduleEvent[],
	leagues: Record<number, string>,
	showDate: boolean,
): string {
	const ordered = sortForDigest(events);
	// Multi-day championships have one row per day but share a single line.
	const championships = [
		...new Set(ordered.filter(isChampionship).map(championshipLine)),
	];
	const others = ordered
		.filter((event) => !isChampionship(event))
		.map((event) => eventLine(event, leagues, showDate));
	return [championships, others]
		.filter((block) => block.length > 0)
		.map((block) => block.join("\n"))
		.join("\n\n");
}

/** The daily digest for `day`, given only the events on that day. */
export function buildDailyDigest(
	day: string,
	events: ScheduleEvent[],
	leagues: Record<number, string>,
): string {
	const title = `## 📅 Tomorrow's events\n-# ${formatDay(day)}\n`;
	const body = digestBody(events, leagues, false) || "No events tomorrow.";
	return [title, body, FOOTER].join("\n");
}

/** The weekly digest, given only the events in next Monday to Sunday. */
export function buildWeeklyDigest(
	events: ScheduleEvent[],
	leagues: Record<number, string>,
): string {
	const title = "## 📆 Next week's sanctioned events\n";
	const body =
		digestBody(events.filter(isSanctioned), leagues, true) ||
		"No sanctioned events this week.";
	return [title, body, FOOTER].join("\n");
}
