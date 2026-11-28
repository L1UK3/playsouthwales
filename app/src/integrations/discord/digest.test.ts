import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ScheduleEvent } from "#/types/domain";
import {
	addDays,
	buildDailyDigest,
	buildWeeklyDigest,
	FOOTER,
	formatDay,
	nextWeek,
} from "./digest";

const LEAGUES = { 1: "Cardiff Dragon Guild", 2: "Mana Haven Cardiff" };

let nextId = 1;
const event = (
	eventType: string,
	date: string,
	leagueId = 1,
	name = "Event",
	game = "TCG",
): ScheduleEvent =>
	({ id: nextId++, eventType, date, leagueId, name, game }) as ScheduleEvent;

describe("digest dates", () => {
	it("formats a day like Thu 29 Oct", () => {
		assert.equal(formatDay("2026-10-29"), "Thu 29 Oct");
	});

	it("adds days across a month end", () => {
		assert.equal(addDays("2026-10-31", 1), "2026-11-01");
	});

	it("finds next Monday to Sunday from a Sunday", () => {
		assert.deepEqual(nextWeek("2026-11-01"), {
			start: "2026-11-02",
			end: "2026-11-08",
		});
	});

	it("finds next Monday to Sunday from a Wednesday", () => {
		assert.deepEqual(nextWeek("2026-10-28"), {
			start: "2026-11-02",
			end: "2026-11-08",
		});
	});
});

describe("buildDailyDigest", () => {
	it("lists the day's events", () => {
		const message = buildDailyDigest(
			"2026-10-29",
			[
				event("CHALLENGE", "2026-10-29", 1, "League Challenge"),
				event("STANDARD", "2026-10-29", 2, "Thursday League"),
				event("CASUAL", "2026-10-29", 2, "VGC Practice", "VGC"),
			],
			LEAGUES,
		);
		assert.equal(
			message,
			[
				"## 📅 Tomorrow's events\n-# Thu 29 Oct\n",
				"**🏅 Challenge** · TCG · Cardiff Dragon Guild",
				"**⚔️ Standard league** · TCG · Mana Haven Cardiff",
				"**🎲 Casual league** · VGC · Mana Haven Cardiff",
				FOOTER,
			].join("\n"),
		);
	});

	it("says when there are no events", () => {
		assert.equal(
			buildDailyDigest("2026-10-29", [], LEAGUES),
			[
				"## 📅 Tomorrow's events\n-# Thu 29 Oct\n",
				"No events tomorrow.",
				FOOTER,
			].join("\n"),
		);
	});

	it("puts championships first, then orders by type", () => {
		const message = buildDailyDigest(
			"2026-10-29",
			[
				event("CASUAL", "2026-10-29", 2, "VGC Practice", "VGC"),
				event("STANDARD", "2026-10-29", 2, "Thursday League"),
				event("CUP", "2026-10-29", 1, "League Cup"),
				event("CHALLENGE", "2026-10-29", 1, "League Challenge"),
				event("WORLDS", "2026-10-29", 1, "World Championships"),
				event("REGIONAL", "2026-10-29", 1, "Cardiff Regional"),
			],
			LEAGUES,
		);
		assert.equal(
			message,
			[
				"## 📅 Tomorrow's events\n-# Thu 29 Oct\n",
				"**📍 Cardiff Regional**",
				"**🌍 World Championships**",
				"",
				"**🏅 Challenge** · TCG · Cardiff Dragon Guild",
				"**🏆 Cup** · TCG · Cardiff Dragon Guild",
				"**⚔️ Standard league** · TCG · Mana Haven Cardiff",
				"**🎲 Casual league** · VGC · Mana Haven Cardiff",
				FOOTER,
			].join("\n"),
		);
	});

	it("labels unknown and missing event types", () => {
		const message = buildDailyDigest(
			"2026-10-29",
			[event("NEW TYPE", "2026-10-29"), event("", "2026-10-29")],
			LEAGUES,
		);
		assert.match(message, /\*\*New Type\*\* · TCG · Cardiff Dragon Guild/);
		assert.match(message, /\*\*Event\*\* · TCG · Cardiff Dragon Guild/);
	});
});

describe("buildWeeklyDigest", () => {
	it("orders by type and skips league play", () => {
		const message = buildWeeklyDigest(
			[
				event("CASUAL", "2026-11-02", 1, "Monday League"),
				event("CUP", "2026-11-03", 2, "League Cup"),
				event("SPECIAL", "2026-11-04", 1, "Go Fest", "GO"),
				event("CHALLENGE", "2026-11-06", 1, "Challenge", "VGC"),
				event("CHALLENGE", "2026-11-05", 2, "Challenge", "TCG"),
				event("REGIONAL", "2026-11-07", 1, "Regionals", "ALL"),
				event("REGIONAL", "2026-11-08", 1, "Regionals", "ALL"),
			],
			LEAGUES,
		);
		assert.equal(
			message,
			[
				"## 📆 Next week's sanctioned events\n",
				"**📍 Go Fest**",
				"**📍 Regionals**",
				"",
				"**🏅 Challenge** · TCG · Mana Haven Cardiff · Thu 5 Nov",
				"**🏅 Challenge** · VGC · Cardiff Dragon Guild · Fri 6 Nov",
				"**🏆 Cup** · TCG · Mana Haven Cardiff · Tue 3 Nov",
				FOOTER,
			].join("\n"),
		);
	});

	it("lists only championships when there is nothing else", () => {
		assert.equal(
			buildWeeklyDigest(
				[event("INTERNATIONAL", "2026-11-07", 1, "EUIC", "ALL")],
				LEAGUES,
			),
			["## 📆 Next week's sanctioned events\n", "**🌍 EUIC**", FOOTER].join(
				"\n",
			),
		);
	});

	it("says when there are no sanctioned events", () => {
		assert.equal(
			buildWeeklyDigest([event("CASUAL", "2026-11-02")], LEAGUES),
			[
				"## 📆 Next week's sanctioned events\n",
				"No sanctioned events this week.",
				FOOTER,
			].join("\n"),
		);
	});
});
