import type { ScheduleEvent } from "#/types/domain";

export type RecurringEvent = ScheduleEvent & { id: number };

function weekdayOf(dateKey: string): number {
	return new Date(`${dateKey}T00:00:00Z`).getUTCDay();
}

export function expandRecurring(
	recurring: RecurringEvent[],
	month: string,
	includeExcluded: boolean,
): ScheduleEvent[] {
	const [year, monthNumber] = month.split("-").map(Number);
	const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
	const occurrences: ScheduleEvent[] = [];

	for (const event of recurring) {
		const firstDate = event.date.slice(0, 10);
		const weekday = weekdayOf(firstDate);

		for (let day = 1; day <= daysInMonth; day++) {
			const date = `${month}-${String(day).padStart(2, "0")}`;
			if (date < firstDate || weekdayOf(date) !== weekday) continue;

			const isExcluded = event.excludedDates?.includes(date) ?? false;
			if (isExcluded && !includeExcluded) continue;

			occurrences.push({
				...event,
				id:
					event.id * 10_000_000 +
					(year - 2000) * 10_000 +
					monthNumber * 100 +
					day,
				recurringEventId: event.id,
				date,
				isRecurring: true,
				isExcluded,
			});
		}
	}

	return occurrences;
}
