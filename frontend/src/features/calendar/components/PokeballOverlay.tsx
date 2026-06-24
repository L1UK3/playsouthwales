import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import pokeballUrl from '@assets/Pokeball/pokeball.glb?url';
import { playPokeballPop } from '@calendar/utils/playPokeballPop';
import { useSettings } from '@/context/SettingsContext';

/**
 * Properties for the PokeballOverlay component.
 * @property containerRef - Ref to the calendar grid element the Pokeball hovers over.
 * @property selectedDateKey - The dateKey of the currently selected day (YYYY-MM-DD), or null.
 * @property todayKey - The dateKey for today, used as the resting spot when nothing is selected.
 */
export interface PokeballOverlayProps {
    containerRef: React.RefObject<HTMLDivElement | null>;
    selectedDateKey: string | null;
    todayKey: string;
}

const BALL_DIAMETER = 34;
const RIGHT_MARGIN = 18;
const TOP_MARGIN = 22;
const JUMP_DURATION = 480;
const ARC_HEIGHT = 46;
const IDLE_AMPLITUDE = 4;
const IDLE_SPEED = 0.0028;
const ROTATION_SPEED = 1.4;

const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface Point {
    x: number;
    y: number;
}

/**
 * PokeballOverlay renders a small 3D Pokeball that hovers above the calendar grid,
 * spinning gently and hopping in an arc to sit above whichever day is selected.
 * @param {PokeballOverlayProps} props - The properties passed to the component.
 * @returns {JSX.Element} A transparent canvas overlaid on the calendar grid.
 */
const PokeballOverlay: React.FC<PokeballOverlayProps> = ({ containerRef, selectedDateKey, todayKey }) => {
    const { settings } = useSettings();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const activeKeyRef = useRef<string>(selectedDateKey ?? todayKey);

    useEffect(() => {
        activeKeyRef.current = selectedDateKey ?? todayKey;
    }, [selectedDateKey, todayKey]);

    useEffect(() => {
        if (settings.disableAnimations) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const scene = new THREE.Scene();
        // top > bottom keeps the projection's natural handedness so the
        // model's winding order (and therefore face culling) stays correct.
        const camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 1000);
        camera.position.z = 100;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        scene.add(new THREE.AmbientLight(0xffffff, 1.0));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
        dirLight.position.set(40, 80, 120);
        scene.add(dirLight);

        const ball = new THREE.Group();
        scene.add(ball);

        let viewWidth = 1;
        let viewHeight = 1;

        // The resting spot for the active day, in DOM pixel space (origin top-left,
        // y-down) -- the top-right "whitespace" of the cell, beside the date number.
        const computeRestSpot = (): Point | null => {
            const cell = container.querySelector<HTMLElement>(`[data-date-key="${activeKeyRef.current}"]`);
            if (!cell) return null;

            const cellRect = cell.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();

            return {
                x: cellRect.right - canvasRect.left - RIGHT_MARGIN - BALL_DIAMETER / 2,
                y: cellRect.top - canvasRect.top + TOP_MARGIN
            };
        };

        // Three.js camera space here is y-up; DOM rects are y-down.
        const toCameraSpace = (p: Point): Point => ({ x: p.x, y: viewHeight - p.y });

        let base: Point | null = null;
        let jumpFrom: Point = { x: 0, y: 0 };
        let jumpStart = 0;
        let jumping = false;
        let queued: Point | null = null;
        let lastKey = activeKeyRef.current;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            viewWidth = Math.max(rect.width, 1);
            viewHeight = Math.max(rect.height, 1);

            renderer.setSize(viewWidth, viewHeight, false);
            camera.left = 0;
            camera.right = viewWidth;
            camera.top = viewHeight;
            camera.bottom = 0;
            camera.updateProjectionMatrix();

            // Snap to the (possibly moved) rest spot rather than animating a jump.
            const spot = computeRestSpot();
            if (spot) {
                base = toCameraSpace(spot);
                jumping = false;
                queued = null;
                ball.position.set(base.x, base.y, 0);
            }
        };

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);

        let modelReady = false;
        let cancelled = false;

        new GLTFLoader().load(pokeballUrl, (gltf) => {
            if (cancelled) return;

            const model = gltf.scene;
            const box = new THREE.Box3().setFromObject(model);
            const size = new THREE.Vector3();
            const center = new THREE.Vector3();
            box.getSize(size);
            box.getCenter(center);

            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            const scale = BALL_DIAMETER / maxDim;

            model.scale.setScalar(scale);
            model.position.sub(center.multiplyScalar(scale));

            ball.add(model);
            modelReady = true;
        });

        resize();

        let frameId: number;

        const animate = (now: number) => {
            frameId = requestAnimationFrame(animate);
            if (!modelReady) return;

            ball.rotation.y += 0.016 * ROTATION_SPEED;
            ball.rotation.x = Math.sin(now * 0.0012) * 0.12;

            // Only re-evaluate the resting spot when the selected day actually
            // changes (or the very first time) -- recomputing it every frame
            // picks up incidental layout shifts (e.g. cell hover transitions)
            // and turns those into spurious little hops.
            if (activeKeyRef.current !== lastKey || !base) {
                const dateChanged = activeKeyRef.current !== lastKey;
                lastKey = activeKeyRef.current;

                const spot = computeRestSpot();
                if (spot) {
                    const target = toCameraSpace(spot);
                    if (!base || !dateChanged) {
                        base = target;
                        queued = null;
                        ball.position.set(target.x, target.y, 0);
                    } else if (jumping) {
                        // A hop is already in flight -- queue this destination
                        // (replacing any previously queued one) instead of
                        // redirecting mid-air, which is what made spam-clicking
                        // look like the ball was freezing/freaking out.
                        queued = target;
                    } else {
                        jumpFrom = { x: ball.position.x, y: ball.position.y };
                        base = target;
                        jumping = true;
                        jumpStart = now;
                        playPokeballPop();
                    }
                }
            }

            if (!base) {
                renderer.render(scene, camera);
                return;
            }

            let displayX = base.x;
            let displayY = base.y;
            let scaleMod = 1;

            if (jumping) {
                const t = Math.min((now - jumpStart) / JUMP_DURATION, 1);
                const eased = easeInOutQuad(t);
                displayX = lerp(jumpFrom.x, base.x, eased);
                displayY = lerp(jumpFrom.y, base.y, eased) + Math.sin(Math.PI * t) * ARC_HEIGHT;
                scaleMod = 1 + Math.sin(Math.PI * t) * 0.18;

                if (t >= 1) {
                    jumping = false;
                    if (queued) {
                        jumpFrom = base;
                        base = queued;
                        queued = null;
                        jumping = true;
                        jumpStart = now;
                        playPokeballPop();
                    }
                }
            } else {
                displayY += Math.sin(now * IDLE_SPEED) * IDLE_AMPLITUDE;
            }

            // Keep the ball from arcing above the canvas's top edge -- the grid
            // clips overflow, so for top-row cells the arc would otherwise get
            // visibly cut off mid-hop.
            displayY = Math.min(displayY, viewHeight - BALL_DIAMETER / 2);

            ball.position.set(displayX, displayY, 0);
            ball.scale.setScalar(scaleMod);

            renderer.render(scene, camera);
        };
        frameId = requestAnimationFrame(animate);

        return () => {
            cancelled = true;
            cancelAnimationFrame(frameId);
            resizeObserver.disconnect();
            renderer.dispose();
            scene.traverse((obj) => {
                if (obj instanceof THREE.Mesh) {
                    obj.geometry.dispose();
                    const material = obj.material;
                    if (Array.isArray(material)) {
                        material.forEach((m) => m.dispose());
                    } else {
                        material.dispose();
                    }
                }
            });
        };
    }, [containerRef, settings.disableAnimations]);

    if (settings.disableAnimations) {
        return null;
    }

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-5" />;
};

export default PokeballOverlay;
