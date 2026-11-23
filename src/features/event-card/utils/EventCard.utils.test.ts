import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { League, ScheduleEvent } from "#/types/domain";
import { getStoreColor } from "./EventCard.utils";

function makeEvent(overrides: Partial<ScheduleEvent> = {}): ScheduleEvent {
	return {
		id: 1,
		name: "Test Event",
		date: "2026-11-22",
		leagueId: 1,
		eventType: "STANDARD",
		game: "TCG",
		...overrides,
	};
}

function makeLeague(overrides: Partial<League> = {}): League {
	return {
		leagueId: 1,
		name: "Cardiff League",
		brandColor: "#ff0000",
		...overrides,
	};
}

describe("getStoreColor", () => {
	for (const eventType of ["LEGALITY", "RELEASE", "REGULATION"] as const) {
		it(`returns CSS variable for ${eventType} special-day events`, () => {
			const event = makeEvent({ eventType });
			assert.equal(
				getStoreColor(event, makeLeague()),
				"var(--color-special-day-border)",
			);
			assert.equal(
				getStoreColor(event, null),
				"var(--color-special-day-border)",
			);
		});
	}

	it("returns league brandColor for regular events when present", () => {
		const event = makeEvent({ eventType: "CUP" });
		assert.equal(
			getStoreColor(event, makeLeague({ brandColor: "#123456" })),
			"#123456",
		);
	});

	it("falls back to deterministic HSL color when league has no brandColor", () => {
		const event = makeEvent({ eventType: "CASUAL", leagueId: 2 });
		assert.equal(
			getStoreColor(event, null),
			`hsl(${(2 * 137) % 360}, 65%, 55%)`,
		);
	});
});
