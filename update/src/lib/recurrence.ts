import type { ScheduleEvent } from "#/types/domain";

export type RecurringEvent = ScheduleEvent & { id: number };

export function expandRecurring(
	recurring: RecurringEvent[],
	month: string,
	includeExcluded: boolean,
): ScheduleEvent[] {
	const [year, monthNumber] = month.split("-").map(Number);
	const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
	const monthStart = new Date(Date.UTC(year, monthNumber - 1, 1));
	const occurrences: ScheduleEvent[] = [];

	for (const event of recurring) {
		const firstDate = event.date.slice(0, 10);
		if (firstDate.slice(0, 7) > month) continue;

		// Start from the first occurrence, or the 1st if it began before this
		// month, then move forward to the matching weekday and step by a week.
		const first = new Date(`${firstDate}T00:00:00Z`);
		const from = first > monthStart ? first : monthStart;
		const daysToWeekday = (first.getUTCDay() - from.getUTCDay() + 7) % 7;

		for (
			let day = from.getUTCDate() + daysToWeekday;
			day <= daysInMonth;
			day += 7
		) {
			const date = `${month}-${String(day).padStart(2, "0")}`;

			const isExcluded = event.excludedDates?.includes(date) ?? false;
			if (isExcluded && !includeExcluded) continue;

			occurrences.push({
				...event,
				// Unique per occurrence. Use recurringEventId to find the series.
				id: `${event.id}:${date}`,
				recurringEventId: event.id,
				date,
				isRecurring: true,
				isExcluded,
			});
		}
	}

	return occurrences;
}
