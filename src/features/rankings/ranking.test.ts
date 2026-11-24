import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rankPlayers } from "./ranking";

describe("rankPlayers", () => {
	it("orders by points, then name, and numbers positions from 1", () => {
		const ranked = rankPlayers([
			{ name: "Owain", cp: 85 },
			{ name: "Bethan", cp: 240 },
			{ name: "Alys", cp: 85 },
		]);
		assert.deepEqual(ranked, [
			{ name: "Bethan", cp: 240, position: 1 },
			{ name: "Alys", cp: 85, position: 2 },
			{ name: "Owain", cp: 85, position: 3 },
		]);
	});

	it("does not reorder its input", () => {
		const players = [
			{ name: "B", cp: 1 },
			{ name: "A", cp: 2 },
		];
		rankPlayers(players);
		assert.equal(players[0].name, "B");
	});
});
