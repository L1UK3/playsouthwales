import { querySchedule } from "#/db/queries.server";
import { eventDateKey, todayDateKey } from "#/lib/month";
import type { ScheduleEvent } from "#/types/domain";
import {
	addDays,
	buildDailyDigest,
	buildWeeklyDigest,
	nextWeek,
} from "./digest";
import { sendDiscordMessage } from "./discord.server";

/**
 * Events from `start` to `end` inclusive, with weekly series expanded and
 * set and regulation markers included, plus league names by id.
 */
async function loadDigestEvents(
	start: string,
	end: string,
): Promise<{ events: ScheduleEvent[]; leagues: Record<number, string> }> {
	const months = [...new Set([start.slice(0, 7), end.slice(0, 7)])];
	const schedules = await Promise.all(
		months.map((month) => querySchedule(month, false)),
	);

	const leagues: Record<number, string> = {};
	for (const league of schedules[0].leagues) {
		leagues[league.leagueId] = league.name;
	}
	const events = schedules
		.flatMap((schedule) => schedule.events)
		.filter((event) => {
			const day = eventDateKey(event);
			return day >= start && day <= end;
		});
	return { events, leagues };
}

/** Post tomorrow's events to Discord. */
export async function postDailyDigest(now = new Date()): Promise<void> {
	const tomorrow = addDays(todayDateKey(now), 1);
	const { events, leagues } = await loadDigestEvents(tomorrow, tomorrow);
	await sendDiscordMessage(buildDailyDigest(tomorrow, events, leagues));
}

/** Post next Monday to Sunday's sanctioned events to Discord. */
export async function postWeeklyDigest(now = new Date()): Promise<void> {
	const { start, end } = nextWeek(todayDateKey(now));
	const { events, leagues } = await loadDigestEvents(start, end);
	await sendDiscordMessage(buildWeeklyDigest(events, leagues));
}
