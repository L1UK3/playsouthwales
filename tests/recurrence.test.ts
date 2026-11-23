import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { RecurringEvent } from "#/lib/recurrence";
import { expandRecurring, isValidCalendarDate } from "#/lib/recurrence";

function makeRecurringEvent(
	overrides: Partial<RecurringEvent> = {},
): RecurringEvent {
	return {
		id: 1,
		name: "Weekly Locals",
		date: "2026-11-01",
		leagueId: 1,
		eventType: "STANDARD",
		game: "TCG",
		...overrides,
	};
}

describe("isValidCalendarDate", () => {
	it("accepts valid calendar dates", () => {
		assert.equal(isValidCalendarDate("2026-11-24"), true);
		assert.equal(isValidCalendarDate("2024-02-29"), true); // leap year
		assert.equal(isValidCalendarDate("2026-01-31"), true);
	});

	it("rejects impossible calendar dates", () => {
		assert.equal(isValidCalendarDate("2026-02-31"), false);
		assert.equal(isValidCalendarDate("2023-02-29"), false); // non-leap year
		assert.equal(isValidCalendarDate("2026-04-31"), false); // April has 30 days
		assert.equal(isValidCalendarDate("2026-13-01"), false); // month 13
		assert.equal(isValidCalendarDate("2026-00-10"), false); // month 00
		assert.equal(isValidCalendarDate("2026-05-00"), false); // day 00
		assert.equal(isValidCalendarDate("2026-01-32"), false); // day 32
	});

	it("rejects malformed strings", () => {
		assert.equal(isValidCalendarDate(""), false);
		assert.equal(isValidCalendarDate("invalid"), false);
		assert.equal(isValidCalendarDate("2026-2-5"), false);
		assert.equal(isValidCalendarDate("2026-02-28T12:00:00Z"), false);
	});
});

describe("expandRecurring", () => {
	it("expands a valid weekly recurring event for the target month", () => {
		// 2026-11-01 is a Sunday
		const event = makeRecurringEvent({ id: 42, date: "2026-11-01" });
		const occurrences = expandRecurring([event], "2026-11", false);

		// Sundays in Nov 2026: 1st, 8th, 15th, 22nd, 29th (5 occurrences)
		assert.equal(occurrences.length, 5);
		assert.equal(occurrences[0].date, "2026-11-01");
		assert.equal(occurrences[0].id, "42:2026-11-01");
		assert.equal(occurrences[4].date, "2026-11-29");
	});

	it("skips and warns on an event with an invalid start date", () => {
		const warnings: string[] = [];
		const originalWarn = console.warn;
		console.warn = (msg: string) => {
			warnings.push(msg);
		};

		try {
			const invalidEvent = makeRecurringEvent({ id: 99, date: "2026-02-31" });
			const occurrences = expandRecurring([invalidEvent], "2026-02", false);

			assert.equal(occurrences.length, 0);
			assert.equal(warnings.length, 1);
			assert.match(
				warnings[0],
				/\[expandRecurring\] Skipping recurring event 99/,
			);
		} finally {
			console.warn = originalWarn;
		}
	});
});
