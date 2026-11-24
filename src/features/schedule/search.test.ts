import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { monthGrid } from "#/lib/month";
import { filterPatch, validateScheduleSearch } from "./search";

describe("validateScheduleSearch", () => {
	it("keeps valid params and drops invalid ones", () => {
		assert.deepEqual(
			validateScheduleSearch({
				month: "2026-13",
				view: "grid",
				day: "",
				league: "7",
				type: "CUP",
				game: "TCG",
			}),
			{
				month: undefined,
				view: undefined,
				day: undefined,
				league: 7,
				type: "CUP",
				game: "TCG",
			},
		);
	});
});

describe("filterPatch", () => {
	it("maps filter controls to search keys, clearing on empty", () => {
		assert.deepEqual(filterPatch("league", "3"), { league: 3 });
		assert.deepEqual(filterPatch("eventType", ""), { type: undefined });
		assert.deepEqual(filterPatch("game", "VGC"), { game: "VGC" });
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
