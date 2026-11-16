import { useEffect, useMemo, useState } from "react";
import { getSchedule } from "#/features/schedule/schedule.functions";
import type { EventTypeMap, ScheduleEvent } from "#/types/domain";

type ScheduleData = Awaited<ReturnType<typeof getSchedule>>;

const EMPTY_TYPES: EventTypeMap = {};

/**
 * Formats a date as YYYY-MM-DD in local time, matching event date strings.
 */
function toDateKey(date: Date): string {
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Returns a league's next events, from today onwards.
 *
 * It reads this month and next month through the schedule server function,
 * so it includes weekly recurring events. Reading two months keeps the list
 * filled near the end of a month.
 */
export function useLeagueUpcomingEvents(leagueId: number, limit: number) {
	// Fixed for the component's lifetime, so the requests stay stable.
	const [{ thisMonth, nextMonth, todayKey }] = useState(() => {
		const now = new Date();
		return {
			thisMonth: toDateKey(
				new Date(now.getFullYear(), now.getMonth(), 1),
			).slice(0, 7),
			nextMonth: toDateKey(
				new Date(now.getFullYear(), now.getMonth() + 1, 1),
			).slice(0, 7),
			todayKey: toDateKey(now),
		};
	});

	const [schedules, setSchedules] = useState<ScheduleData[]>();
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);

	useEffect(() => {
		let cancelled = false;

		Promise.all([
			getSchedule({ data: { month: thisMonth } }),
			getSchedule({ data: { month: nextMonth } }),
		])
			.then((loaded) => {
				if (!cancelled) setSchedules(loaded);
			})
			.catch(() => {
				if (!cancelled) setIsError(true);
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [thisMonth, nextMonth]);

	const events = useMemo<ScheduleEvent[]>(() => {
		const all = (schedules ?? []).flatMap((schedule) => schedule.events);

		return all
			.filter(
				(event) =>
					event.leagueId === leagueId &&
					!event.isExcluded &&
					event.date.slice(0, 10) >= todayKey,
			)
			.sort((a, b) => {
				const byDate = a.date.slice(0, 10).localeCompare(b.date.slice(0, 10));
				return byDate !== 0
					? byDate
					: (a.startTime ?? "").localeCompare(b.startTime ?? "");
			})
			.slice(0, limit);
	}, [schedules, leagueId, todayKey, limit]);

	return {
		events,
		types: schedules?.[0]?.types ?? EMPTY_TYPES,
		isLoading,
		isError,
	};
}

export default useLeagueUpcomingEvents;
