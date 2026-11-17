import { currentMonthKey } from "#/lib/month";

export function currentSeason(now = new Date()): string {
	const [year, month] = currentMonthKey(now).split("-").map(Number);
	return String(month >= 7 ? year + 1 : year);
}
