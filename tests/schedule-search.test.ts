import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	filterPatch,
	validateScheduleSearch,
} from "#/features/schedule/search";

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
