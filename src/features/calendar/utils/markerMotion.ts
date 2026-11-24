export interface Point {
	x: number;
	y: number;
}

/** Size and motion amplitudes of the Active Marker, in CSS pixels. */
export interface MarkerMetrics {
	ballDiameter: number;
	rightMargin: number;
	topMargin: number;
	arcHeight: number;
	idleAmplitude: number;
}

export function markerMetrics(viewportWidth: number): MarkerMetrics {
	const isMobile = viewportWidth < 640;
	return {
		ballDiameter: isMobile ? 24 : 34,
		rightMargin: isMobile ? 4 : 18,
		topMargin: isMobile ? 12 : 22,
		arcHeight: isMobile ? 30 : 46,
		idleAmplitude: isMobile ? 3 : 4,
	};
}

/** Where to draw the marker this frame (y-up camera space) and its size. */
export interface MarkerFrame {
	x: number;
	y: number;
	scale: number;
}

const JUMP_DURATION = 480;
const IDLE_SPEED = 0.0028;

const easeInOutQuad = (t: number) =>
	t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * The Active Marker's motion: it idles (bobs) at a rest spot, hops in an arc
 * to a new one, and queues at most one destination while a hop is in flight
 * (replacing any earlier queued one) instead of redirecting mid-air.
 * Pure: time is passed in, so it can be driven by tests as well as rAF.
 */
export function createMarkerMotion(options: { onHop?: () => void } = {}) {
	let base: Point | null = null;
	let last: Point = { x: 0, y: 0 };
	let jumpFrom: Point = { x: 0, y: 0 };
	let jumpStart = 0;
	let jumping = false;
	let queued: Point | null = null;

	const startHop = (from: Point, to: Point, now: number) => {
		jumpFrom = from;
		base = to;
		jumping = true;
		jumpStart = now;
		options.onHop?.();
	};

	return {
		hasRest: () => base !== null,

		/** Place the marker at `target` immediately, dropping any hop. */
		snap(target: Point) {
			base = target;
			last = target;
			jumping = false;
			queued = null;
		},

		/** Hop to `target`, or queue it if a hop is already in flight. */
		hopTo(target: Point, now: number) {
			if (jumping) queued = target;
			else startHop(last, target, now);
		},

		/** Advance to `now`; null until a rest spot is known. */
		frame(
			now: number,
			metrics: MarkerMetrics,
			viewHeight: number,
		): MarkerFrame | null {
			if (!base) return null;

			let x = base.x;
			let y = base.y;
			let scaleMod = 1;

			if (jumping) {
				const t = Math.min((now - jumpStart) / JUMP_DURATION, 1);
				const eased = easeInOutQuad(t);
				x = lerp(jumpFrom.x, base.x, eased);
				y =
					lerp(jumpFrom.y, base.y, eased) +
					Math.sin(Math.PI * t) * metrics.arcHeight;
				scaleMod = 1 + Math.sin(Math.PI * t) * 0.18;

				if (t >= 1) {
					jumping = false;
					if (queued) {
						const next = queued;
						queued = null;
						startHop(base, next, now);
					}
				}
			} else {
				y += Math.sin(now * IDLE_SPEED) * metrics.idleAmplitude;
			}

			// Keep the ball from arcing above the canvas's top edge -- the grid
			// clips overflow, so for top-row cells the arc would otherwise get
			// visibly cut off mid-hop.
			y = Math.min(y, viewHeight - metrics.ballDiameter / 2);

			last = { x, y };
			return { x, y, scale: metrics.ballDiameter * scaleMod };
		},
	};
}
