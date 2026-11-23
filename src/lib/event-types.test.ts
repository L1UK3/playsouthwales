import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ScheduleEvent } from "#/types/domain";
import { rankOf, sortEventsForSchedule } from "./event-types";

function makeEvent(overrides: Partial<ScheduleEvent> = {}): ScheduleEvent {
	return {
		id: 1,
		name: "Test Event",
		date: "2026-11-24",
		startTime: "18:00",
		leagueId: 1,
		eventType: "STANDARD",
		game: "TCG",
		...overrides,
	};
}

describe("rankOf", () => {
	it("ranks special and high tier events ahead of local events", () => {
		assert.equal(rankOf("LEGALITY"), 0);
		assert.equal(rankOf("RELEASE"), 0);
		assert.equal(rankOf("REGULATION"), 0);
		assert.equal(rankOf("WORLDS"), 1);
		assert.equal(rankOf("REGIONAL"), 1);
		assert.equal(rankOf("CUP"), 2);
		assert.equal(rankOf("CHALLENGE"), 3);
		assert.equal(rankOf("PRE-RELEASE"), 4);
		assert.equal(rankOf("STANDARD"), 5);
		assert.equal(rankOf("CASUAL"), 6);
	});

	it("falls back to unknown rank for undefined or unrecognized types", () => {
		assert.equal(rankOf(undefined), 7);
		assert.equal(rankOf(null), 7);
		assert.equal(rankOf("CUSTOM_EVENT"), 7);
	});
});

describe("compareEventsForSchedule & sortEventsForSchedule", () => {
	it("sorts primarily by date ascending", () => {
		const ev1 = makeEvent({ id: 1, date: "2026-11-25" });
		const ev2 = makeEvent({ id: 2, date: "2026-11-24" });

		const sorted = sortEventsForSchedule([ev1, ev2]);
		assert.deepEqual(
			sorted.map((e) => e.id),
			[2, 1],
		);
	});

	it("safely trims dates with accidental timestamp suffixes", () => {
		const ev1 = makeEvent({
			id: 1,
			date: "2026-11-24T18:00:00Z",
			eventType: "CASUAL",
		});
		const ev2 = makeEvent({ id: 2, date: "2026-11-24", eventType: "CUP" });

		// Since date portions are both "2026-11-24", CUP (rank 2) should precede CASUAL (rank 6)
		const sorted = sortEventsForSchedule([ev1, ev2]);
		assert.equal(sorted[0].id, 2);
		assert.equal(sorted[1].id, 1);
	});

	it("sorts by eventType rank when dates match", () => {
		const casual = makeEvent({ id: 1, eventType: "CASUAL" });
		const cup = makeEvent({ id: 2, eventType: "CUP" });
		const release = makeEvent({ id: 3, eventType: "RELEASE" });
		const challenge = makeEvent({ id: 4, eventType: "CHALLENGE" });

		const sorted = sortEventsForSchedule([casual, cup, release, challenge]);
		assert.deepEqual(
			sorted.map((e) => e.eventType),
			["RELEASE", "CUP", "CHALLENGE", "CASUAL"],
		);
	});

	it("sorts by startTime when date and eventType rank match", () => {
		const late = makeEvent({ id: 1, startTime: "19:00" });
		const early = makeEvent({ id: 2, startTime: "10:00" });
		const none = makeEvent({ id: 3, startTime: undefined });

		const sorted = sortEventsForSchedule([late, none, early]);
		assert.deepEqual(
			sorted.map((e) => e.id),
			[3, 2, 1], // empty/null startTime ("") comes first alphabetically
		);
	});

	it("returns identical reference for empty or single-item lists", () => {
		const empty: ScheduleEvent[] = [];
		assert.equal(sortEventsForSchedule(empty), empty);

		const single = [makeEvent()];
		assert.equal(sortEventsForSchedule(single), single);
	});
});
