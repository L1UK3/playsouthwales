import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { eventDateKey, localDateKey, monthGrid } from "#/lib/month";

describe("day keys", () => {
	it("formats a local date as YYYY-MM-DD", () => {
		assert.equal(localDateKey(new Date(2026, 0, 5)), "2026-01-05");
	});

	it("takes an event's day from its date, ignoring any time", () => {
		assert.equal(eventDateKey({ date: "2026-11-24T19:00:00" }), "2026-11-24");
	});
});

describe("monthGrid", () => {
	it("pads a month to whole Monday-first weeks", () => {
		// November 2026 starts on a Sunday and ends on a Monday.
		const grid = monthGrid("2026-11");
		assert.equal(grid.length, 42);
		assert.equal(grid[0].dateKey, "2026-10-26");
		assert.equal(grid[6].dateKey, "2026-11-01");
		assert.equal(grid[0].isOtherMonth, true);
		assert.equal(grid[6].isOtherMonth, false);
		assert.equal(grid.at(-1)?.dateKey, "2026-12-06");
	});
});
