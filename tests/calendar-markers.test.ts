import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { selectSchedule } from "#/features/schedule/select";
import { rankOf } from "#/lib/event-types";
import type { ScheduleEvent } from "#/types/domain";

describe("Calendar date markers (TCG sets & VGC regulations)", () => {
	it("ranks date markers ahead of other event types", () => {
		assert.equal(rankOf("LEGALITY"), 0);
		assert.equal(rankOf("RELEASE"), 0);
		assert.equal(rankOf("REGULATION"), 0);
	});

	it("shows date markers on calendar view regardless of filters", () => {
		const releaseEvent: ScheduleEvent = {
			id: "release-ME6",
			name: "Delta Reign",
			date: "2026-11-06",
			leagueId: -1,
			eventType: "RELEASE",
			game: "TCG",
		};
		const regEvent: ScheduleEvent = {
			id: "reg-regulation-h",
			name: "Regulation H",
			date: "2026-11-10",
			leagueId: -1,
			eventType: "REGULATION",
			game: "VGC",
		};
		const normalEvent: ScheduleEvent = {
			id: 1,
			name: "Local League",
			date: "2026-11-06",
			leagueId: 2,
			eventType: "STANDARD",
			game: "TCG",
		};

		// Filter for league 1, which excludes normalEvent
		const selection = selectSchedule(
			[releaseEvent, regEvent, normalEvent],
			{ league: 1 },
			"2026-11",
			undefined,
		);

		// Calendar includes release and regulation markers even when league filter is active
		assert.deepEqual(selection.calendar["2026-11-06"], [releaseEvent]);
		assert.deepEqual(selection.calendar["2026-11-10"], [regEvent]);

		// List view excludes date markers
		assert.equal(selection.list["2026-11-06"], undefined);
		assert.equal(selection.list["2026-11-10"], undefined);
	});
});
