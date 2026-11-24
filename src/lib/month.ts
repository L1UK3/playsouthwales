const MONTH_NAMES = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
] as const;

const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const pad = (value: number) => String(value).padStart(2, "0");

export function isMonthKey(value: unknown): value is string {
	return typeof value === "string" && MONTH_KEY_PATTERN.test(value);
}

function toMonthKey(date: Date): string {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

const LONDON_DATE = new Intl.DateTimeFormat("en-GB", {
	timeZone: "Europe/London",
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

export function todayDateKey(now = new Date()): string {
	const part = (type: Intl.DateTimeFormatPartTypes) =>
		LONDON_DATE.formatToParts(now).find((p) => p.type === type)?.value ?? "";
	return `${part("year")}-${part("month")}-${part("day")}`;
}

export function currentMonthKey(now = new Date()): string {
	return todayDateKey(now).slice(0, 7);
}

function parseMonthKey(key: string): Date {
	const [year, month] = key.split("-").map(Number);
	return new Date(year, month - 1, 1);
}

export function shiftMonth(key: string, delta: number): string {
	const date = parseMonthKey(key);
	return toMonthKey(new Date(date.getFullYear(), date.getMonth() + delta, 1));
}

export function formatMonth(key: string): { monthName: string; year: number } {
	const date = parseMonthKey(key);
	return { monthName: MONTH_NAMES[date.getMonth()], year: date.getFullYear() };
}

/** YYYY-MM-DD for `date` in the browser's local time zone. */
export function localDateKey(date: Date): string {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Long, locale-formatted heading for a YYYY-MM-DD key, e.g. "Monday, 2 March 2026". */
export function formatDayHeading(dateKey: string): string {
	return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

/** One day cell of a month grid. */
export interface MonthGridDay {
	day: number;
	dateKey: string;
	isOtherMonth: boolean;
}

/**
 * The Monday-first grid of whole weeks covering a YYYY-MM month, padded with
 * the trailing days of the previous month and leading days of the next.
 */
export function monthGrid(key: string): MonthGridDay[] {
	const first = parseMonthKey(key);
	const year = first.getFullYear();
	const month = first.getMonth();
	const offset = (first.getDay() + 6) % 7;
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const total = Math.ceil((offset + daysInMonth) / 7) * 7;

	return Array.from({ length: total }, (_, index) => {
		const date = new Date(year, month, index - offset + 1);
		return {
			day: date.getDate(),
			dateKey: localDateKey(date),
			isOtherMonth: date.getMonth() !== month,
		};
	});
}
