import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { League, ScheduleEvent } from "#/types/domain";
import { describeEventCard, getStoreColor } from "./EventCard.utils";

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

describe("describeEventCard", () => {
	it("resolves league, colour and labels for a league event", () => {
		const league = makeLeague({ brandColor: "#123456" });
		const view = describeEventCard(
			makeEvent({ eventType: "CUP", game: "ALL" }),
			{ 1: league },
		);
		assert.equal(view.league, league);
		assert.equal(view.leagueName, "Cardiff League");
		assert.equal(view.storeColor, "#123456");
		assert.equal(view.isOfficial, true);
		assert.equal(view.isDateMarker, false);
		assert.equal(view.gameLabel, "TCG, VGC, GO");
		assert.match(view.description, /League Cups/);
	});

	it("treats every Championship Series event as official", () => {
		const view = describeEventCard(makeEvent({ eventType: "CASUAL" }), {
			1: makeLeague({ isChampionshipSeries: true }),
		});
		assert.equal(view.isChampionship, true);
		assert.equal(view.isOfficial, true);
	});

	it("describes date markers without a league", () => {
		const view = describeEventCard(
			makeEvent({ eventType: "RELEASE", leagueId: -1, leagueName: "Sets" }),
			{ 1: makeLeague() },
		);
		assert.equal(view.league, null);
		assert.equal(view.leagueName, "Sets");
		assert.equal(view.isDateMarker, true);
		assert.equal(view.storeColor, "var(--color-special-day-border)");
	});
});
