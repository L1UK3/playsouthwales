import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createMarkerMotion, markerMetrics } from "./markerMotion";

const metrics = markerMetrics(1024);
const VIEW_HEIGHT = 1000;

describe("createMarkerMotion", () => {
	it("draws nothing until a rest spot is known", () => {
		const motion = createMarkerMotion();
		assert.equal(motion.hasRest(), false);
		assert.equal(motion.frame(0, metrics, VIEW_HEIGHT), null);
	});

	it("idles at the snapped rest spot", () => {
		const motion = createMarkerMotion();
		motion.snap({ x: 100, y: 200 });
		const frame = motion.frame(0, metrics, VIEW_HEIGHT);
		assert.deepEqual(frame, { x: 100, y: 200, scale: metrics.ballDiameter });
	});

	it("hops to a new spot and lands there", () => {
		let hops = 0;
		const motion = createMarkerMotion({ onHop: () => hops++ });
		motion.snap({ x: 0, y: 0 });
		motion.frame(0, metrics, VIEW_HEIGHT);
		motion.hopTo({ x: 100, y: 0 }, 0);
		const mid = motion.frame(240, metrics, VIEW_HEIGHT);
		assert.ok(mid && mid.y > 0, "arcs upwards mid-hop");
		const landed = motion.frame(480, metrics, VIEW_HEIGHT);
		assert.equal(landed?.x, 100);
		assert.equal(hops, 1);
	});

	it("queues only the latest destination while a hop is in flight", () => {
		const motion = createMarkerMotion();
		motion.snap({ x: 0, y: 0 });
		motion.hopTo({ x: 100, y: 0 }, 0);
		motion.hopTo({ x: 200, y: 0 }, 10);
		motion.hopTo({ x: 300, y: 0 }, 20);
		motion.frame(480, metrics, VIEW_HEIGHT);
		const landed = motion.frame(960, metrics, VIEW_HEIGHT);
		assert.equal(landed?.x, 300);
	});

	it("never arcs above the top of the canvas", () => {
		const motion = createMarkerMotion();
		motion.snap({ x: 0, y: VIEW_HEIGHT });
		const frame = motion.frame(0, metrics, VIEW_HEIGHT);
		assert.equal(frame?.y, VIEW_HEIGHT - metrics.ballDiameter / 2);
	});
});
