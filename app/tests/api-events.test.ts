import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ApiError } from "#/lib/api";
import {
	type ApiEvent,
	groupEvents,
	parseEventsQuery,
	toApiEvent,
} from "#/lib/events-query";
import { expandRecurring } from "#/lib/recurrence";

const now = new Date("2026-11-28T12:00:00Z");
const parse = (query: string) =>
	parseEventsQuery(new URLSearchParams(query), now);

describe("parseEventsQuery", () => {
	it("reads every parameter", () => {
		assert.deepEqual(
			parse("leagueId=3&day=2026-11-21&month=2026-11&year=2026&groupBy=day"),
			{ leagueId: 3, period: "2026-11-21", groupBy: "day" },
		);
	});

	it("uses the most specific date filter, or null when filters conflict", () => {
		assert.equal(parse("").period, "2026-11");
		assert.equal(parse("year=2026&month=2026-03").period, "2026-03");
		assert.equal(parse("year=2025").period, "2025");
		assert.equal(parse("year=2025&month=2026-03").period, null);
		assert.equal(parse("month=2026-03&day=2026-04-01").period, null);
	});

	it("rejects invalid parameters", () => {
		for (const query of [
			"leagueId=abc",
			"leagueId=1.5",
			"leagueId=1e3",
			"day=2026-02-30",
			"day=2026-1-01",
			"month=2026-13",
			"year=26",
			"groupBy=week",
		]) {
			assert.throws(
				() => parse(query),
				(error: unknown) =>
					error instanceof ApiError &&
					error.status === 400 &&
					error.code === "invalid_parameter",
				query,
			);
		}
	});
});

describe("toApiEvent", () => {
	it("keeps only documented properties and omits empty optionals", () => {
		const event = toApiEvent({
			id: 7,
			name: "League Cup",
			date: "2026-11-21",
			startTime: "",
			leagueId: 2,
			eventType: "CUP",
			game: "TCG",
			description: "Bring a deck",
			pokedataGuid: "abc",
			leagueName: "Cardiff",
			excludedDates: [],
		});
		assert.deepEqual(event, {
			id: 7,
			name: "League Cup",
			date: "2026-11-21",
			leagueId: 2,
			eventType: "CUP",
			game: "TCG",
			description: "Bring a deck",
			isRecurring: false,
		});
	});

	it("maps weekly occurrences, omitting excluded dates", () => {
		const occurrences = expandRecurring(
			[
				{
					id: 4,
					name: "Weekly",
					date: "2026-11-02",
					startTime: "18:30:00",
					leagueId: 1,
					eventType: "CASUAL",
					game: "ALL",
					isRecurring: true,
					excludedDates: ["2026-11-09"],
				},
			],
			"2026-11",
			false,
		).map(toApiEvent);

		assert.deepEqual(
			occurrences.map((e) => e.id),
			["4:2026-11-02", "4:2026-11-16", "4:2026-11-23", "4:2026-11-30"],
		);
		assert.deepEqual(occurrences[0], {
			id: "4:2026-11-02",
			name: "Weekly",
			date: "2026-11-02",
			startTime: "18:30",
			leagueId: 1,
			eventType: "CASUAL",
			game: "ALL",
			isRecurring: true,
			recurringEventId: 4,
		});
	});
});

describe("groupEvents", () => {
	const event = (id: number, leagueId: number, date: string): ApiEvent => ({
		id,
		name: `Event ${id}`,
		date,
		leagueId,
		eventType: "CASUAL",
		game: "TCG",
		isRecurring: false,
	});
	const events = [
		event(1, 1, "2026-11-21"),
		event(2, 2, "2026-11-21"),
		event(3, 1, "2026-12-05"),
	];
	const ids = (grouped: Record<string, ApiEvent[]>) =>
		Object.fromEntries(
			Object.entries(grouped).map(([key, list]) => [
				key,
				list.map((e) => e.id),
			]),
		);

	it("groups by league, day, month and year", () => {
		assert.deepEqual(ids(groupEvents(events, "league")), {
			"1": [1, 3],
			"2": [2],
		});
		assert.deepEqual(ids(groupEvents(events, "day")), {
			"2026-11-21": [1, 2],
			"2026-12-05": [3],
		});
		assert.deepEqual(ids(groupEvents(events, "month")), {
			"2026-11": [1, 2],
			"2026-12": [3],
		});
		assert.deepEqual(ids(groupEvents(events, "year")), { "2026": [1, 2, 3] });
	});
});
