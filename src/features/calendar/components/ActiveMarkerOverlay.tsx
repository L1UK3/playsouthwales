import type React from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import activeMarkerUrl from "#/assets/activeMarker.glb?url";
import {
	createMarkerMotion,
	markerMetrics,
	type Point,
} from "#/features/calendar/utils/markerMotion";
// import { playMarkerPop } from '#/features/calendar/utils/playMarkerPop';

/**
 * Properties for the ActiveMarkerOverlay component.
 * @property containerRef - Ref to the calendar grid element the ActiveMarker hovers over.
 * @property selectedDateKey - The dateKey of the currently selected day (YYYY-MM-DD), or undefined.
 * @property todayKey - The dateKey for today, used as the resting spot when nothing is selected.
 */
export interface ActiveMarkerOverlayProps {
	containerRef: React.RefObject<HTMLDivElement | null>;
	selectedDateKey: string | undefined;
	todayKey: string;
}

const ROTATION_SPEED = 1.4;

/** Loads the marker model, normalised to unit size and centred on the origin. */
function loadMarkerModel(onLoad: (model: THREE.Object3D) => void) {
	new GLTFLoader().load(activeMarkerUrl, (gltf) => {
		const model = gltf.scene;
		const box = new THREE.Box3().setFromObject(model);
		const size = new THREE.Vector3();
		const center = new THREE.Vector3();
		box.getSize(size);
		box.getCenter(center);

		const scale = 1 / (Math.max(size.x, size.y, size.z) || 1);
		model.scale.setScalar(scale);
		model.position.sub(center.multiplyScalar(scale));
		onLoad(model);
	});
}

function disposeScene(scene: THREE.Scene) {
	scene.traverse((obj) => {
		if (!(obj instanceof THREE.Mesh)) return;
		obj.geometry.dispose();
		const materials = Array.isArray(obj.material)
			? obj.material
			: [obj.material];
		for (const material of materials) material.dispose();
	});
}

/**
 * ActiveMarkerOverlay renders a small 3D ActiveMarker that hovers above the calendar grid,
 * spinning gently and hopping in an arc to sit above whichever day is selected.
 * Motion lives in `createMarkerMotion`; this component only adapts it to
 * three.js, the DOM and requestAnimationFrame.
 */
const ActiveMarkerOverlay: React.FC<ActiveMarkerOverlayProps> = ({
	containerRef,
	selectedDateKey,
	todayKey,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const activeKeyRef = useRef<string>(selectedDateKey ?? todayKey);

	useEffect(() => {
		activeKeyRef.current = selectedDateKey ?? todayKey;
	}, [selectedDateKey, todayKey]);

	useEffect(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		if (!canvas || !container) return;

		const scene = new THREE.Scene();
		// top > bottom keeps the projection's natural handedness so the
		// model's winding order (and therefore face culling) stays correct.
		const camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 1000);
		camera.position.z = 100;

		const renderer = new THREE.WebGLRenderer({
			canvas,
			alpha: true,
			antialias: true,
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		scene.add(new THREE.AmbientLight(0xffffff, 1.0));
		const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
		dirLight.position.set(40, 80, 120);
		scene.add(dirLight);

		const ball = new THREE.Group();
		scene.add(ball);

		const motion = createMarkerMotion(/* { onHop: playMarkerPop } */);
		let viewHeight = 1;

		// The resting spot for the active day in camera space (y-up): the
		// top-right "whitespace" of the cell, beside the date number.
		const computeRestSpot = (): Point | null => {
			const cell = container.querySelector<HTMLElement>(
				`[data-date-key="${activeKeyRef.current}"]`,
			);
			if (!cell) return null;

			const cellRect = cell.getBoundingClientRect();
			const canvasRect = canvas.getBoundingClientRect();
			const { ballDiameter, rightMargin, topMargin } = markerMetrics(
				window.innerWidth,
			);

			return {
				x: cellRect.right - canvasRect.left - rightMargin - ballDiameter / 2,
				y: viewHeight - (cellRect.top - canvasRect.top + topMargin),
			};
		};

		const snap = (spot: Point) => {
			motion.snap(spot);
			ball.position.set(spot.x, spot.y, 0);
		};

		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			const viewWidth = Math.max(rect.width, 1);
			viewHeight = Math.max(rect.height, 1);

			renderer.setSize(viewWidth, viewHeight, false);
			camera.left = 0;
			camera.right = viewWidth;
			camera.top = viewHeight;
			camera.bottom = 0;
			camera.updateProjectionMatrix();

			// Snap to the (possibly moved) rest spot rather than animating a jump.
			const spot = computeRestSpot();
			if (spot) snap(spot);
		};

		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(container);

		let modelReady = false;
		let cancelled = false;
		loadMarkerModel((model) => {
			if (cancelled) return;
			ball.add(model);
			modelReady = true;
		});

		resize();

		let frameId: number;
		let lastKey = activeKeyRef.current;

		const animate = (now: number) => {
			frameId = requestAnimationFrame(animate);
			if (!modelReady) return;

			ball.rotation.y += 0.016 * ROTATION_SPEED;
			ball.rotation.x = Math.sin(now * 0.0012) * 0.12;

			// Only re-evaluate the resting spot when the selected day actually
			// changes (or the very first time) -- recomputing it every frame
			// picks up incidental layout shifts (e.g. cell hover transitions)
			// and turns those into spurious little hops.
			const dateChanged = activeKeyRef.current !== lastKey;
			if (dateChanged || !motion.hasRest()) {
				lastKey = activeKeyRef.current;
				const spot = computeRestSpot();
				if (spot) {
					if (!motion.hasRest() || !dateChanged) snap(spot);
					else motion.hopTo(spot, now);
				}
			}

			const frame = motion.frame(
				now,
				markerMetrics(window.innerWidth),
				viewHeight,
			);
			if (frame) {
				ball.position.set(frame.x, frame.y, 0);
				ball.scale.setScalar(frame.scale);
			}
			renderer.render(scene, camera);
		};
		frameId = requestAnimationFrame(animate);

		return () => {
			cancelled = true;
			cancelAnimationFrame(frameId);
			resizeObserver.disconnect();
			renderer.dispose();
			disposeScene(scene);
		};
	}, [containerRef]);

	return (
		<canvas
			ref={canvasRef}
			className="absolute inset-0 size-full pointer-events-none z-5"
		/>
	);
};

export default ActiveMarkerOverlay;
