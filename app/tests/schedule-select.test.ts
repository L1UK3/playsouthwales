import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSpecialDay } from "#/features/schedule/select";
import type { ScheduleEvent } from "#/types/domain";

function makeEvent(eventType: string): ScheduleEvent {
	return {
		id: 1,
		name: "Test Event",
		date: "2026-11-24",
		leagueId: 1,
		eventType,
		game: "TCG",
	};
}

describe("isSpecialDay", () => {
	it("highlights days carrying any date marker", () => {
		for (const type of ["LEGALITY", "RELEASE", "REGULATION"]) {
			assert.equal(isSpecialDay([makeEvent("CUP"), makeEvent(type)]), true);
		}
	});

	it("does not highlight days with only played events", () => {
		assert.equal(isSpecialDay([makeEvent("CUP"), makeEvent("CASUAL")]), false);
		assert.equal(isSpecialDay([]), false);
	});
});
