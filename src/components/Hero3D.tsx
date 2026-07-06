import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  CanvasTexture,
  Group,
  Matrix4,
  NormalBlending,
  Points,
  PointsMaterial,
  Raycaster,
  Vector2,
  Vector3,
} from "three";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useHeroActive } from "../hooks/useHeroActive";

const prefersReducedMotion =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Soft radial sprite so stars render as small glows instead of the
// default hard square points.
const makeStarTexture = () => {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.6)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
};

// The camera sits at z=15; keep every star at least 10 units away so none
// balloon into huge blobs right in front of the lens.
const MAX_Z = 5;

const makePositions = (count: number, spread: number) => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 2] = Math.random() * (spread / 2 + MAX_Z) - spread / 2;
  }
  return positions;
};

// Three depth layers: many faint distant stars, a few bright near ones.
const LAYERS = [
  { count: 2200, spread: 95, size: 0.14, darkOpacity: 0.4, lightOpacity: 0.3 },
  { count: 900, spread: 75, size: 0.22, darkOpacity: 0.55, lightOpacity: 0.4 },
  { count: 260, spread: 55, size: 0.32, darkOpacity: 0.7, lightOpacity: 0.5 },
].map((layer) => ({
  ...layer,
  positions: makePositions(layer.count, layer.spread),
}));

// The two brighter layers react to the cursor and can be shattered.
const INTERACTIVE_LAYERS = [LAYERS[1], LAYERS[2]];

type NdcRef = React.RefObject<{
  x: number;
  y: number;
  active: boolean;
  speed: number;
}>;
type ClickQueueRef = React.RefObject<
  { x: number; y: number; clientX: number; clientY: number }[]
>;
type BurstQueueRef = React.RefObject<{ x: number; y: number; z: number }[]>;

function StarLayer({
  layer,
  texture,
}: {
  layer: (typeof LAYERS)[number];
  texture: CanvasTexture;
}) {
  const { isDarkMode } = useTheme();

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[layer.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={layer.size}
        color={isDarkMode ? "#bfdbfe" : "#475569"}
        sizeAttenuation
        transparent
        depthWrite={false}
        blending={isDarkMode ? AdditiveBlending : NormalBlending}
        opacity={isDarkMode ? layer.darkOpacity : layer.lightOpacity}
      />
    </points>
  );
}

const SCATTER_RADIUS = 4;
const SCATTER_STRENGTH = 6;
const SCATTER_JITTER = 0.8;
const SCATTER_EPSILON_SQ = 0.0001;
// Scatter only kicks in on fast cursor sweeps (NDC units/second). A slow,
// deliberate move — aiming at a star to click it — must not push it away.
const SCATTER_SPEED_MIN = 0.7;
const SCATTER_SPEED_MAX = 2.0;
// Max screen angle (as a tangent) between the click ray and a star for a
// shatter hit — roughly a 40px circle around the cursor.
const SHATTER_TAN = 0.05;
const SHATTER_WAVE_RADIUS = 4;
const FAR_AWAY = 1e5;

type LayerRuntime = {
  positions: Float32Array;
  offsets: Float32Array;
  hiddenTime: Float32Array;
};

// The bright star layers are the interactive ones: stars near the pointer's
// sight-line get nudged away with a little jitter (a twinkling scatter), and
// a click shatters the star whose *displayed* position is nearest the cursor
// in screen angle — it hides, neighbors ripple, and a fragment burst is
// queued. The star twinkles back together seconds later.
function InteractiveStars({
  texture,
  pointerNdc,
  clickQueue,
  burstQueue,
}: {
  texture: CanvasTexture;
  pointerNdc: NdcRef;
  clickQueue: ClickQueueRef;
  burstQueue: BurstQueueRef;
}) {
  const { isDarkMode } = useTheme();
  const pointsRefs = useRef<(Points | null)[]>([]);
  const runtimeRef = useRef<LayerRuntime[]>(null);
  runtimeRef.current ??= INTERACTIVE_LAYERS.map((layer) => ({
    positions: layer.positions.slice(),
    offsets: new Float32Array(layer.count * 3),
    hiddenTime: new Float32Array(layer.count),
  }));
  const hiddenCount = useRef(0);
  const needsAnotherFrame = useRef(false);

  const scratch = useMemo(
    () => ({
      raycaster: new Raycaster(),
      ndc: new Vector2(),
      inverse: new Matrix4(),
      origin: new Vector3(),
      dir: new Vector3(),
    }),
    [],
  );

  useFrame((state, delta) => {
    const runtimes = runtimeRef.current!;
    const firstPoints = pointsRefs.current[0];
    if (!firstPoints) return;

    const pointer = pointerNdc.current;
    const hasClicks = clickQueue.current.length > 0;
    if (
      !pointer.active &&
      !needsAnotherFrame.current &&
      !hasClicks &&
      hiddenCount.current === 0
    ) {
      return;
    }

    const dt = Math.min(delta, 0.05);
    const { raycaster, ndc, inverse, origin, dir } = scratch;

    // Rays must live in the Drift group's local space — the group rotates,
    // so a raw world ray would land off-cursor. Both layers share the same
    // transform, so one inverse serves both.
    firstPoints.updateMatrixWorld();
    inverse.copy(firstPoints.matrixWorld).invert();

    const setLocalRay = (x: number, y: number) => {
      ndc.set(x, y);
      raycaster.setFromCamera(ndc, state.camera);
      origin.copy(raycaster.ray.origin).applyMatrix4(inverse);
      dir.copy(raycaster.ray.direction).transformDirection(inverse);
    };

    // Shatter clicks: hit-test against what is actually on screen (the
    // displayed attribute arrays, scatter offsets included), comparing
    // screen angle so depth doesn't skew which star "under the cursor" wins.
    while (clickQueue.current.length > 0) {
      const click = clickQueue.current.shift()!;
      const { clientX, clientY } = click;
      setLocalRay(click.x, click.y);

      let bestLayer = -1;
      let bestIndex = -1;
      let bestTanSq = SHATTER_TAN * SHATTER_TAN;

      for (let li = 0; li < runtimes.length; li++) {
        const points = pointsRefs.current[li];
        if (!points) continue;
        const arr = points.geometry.attributes.position.array as Float32Array;
        const hiddenTime = runtimes[li].hiddenTime;
        const count = INTERACTIVE_LAYERS[li].count;

        for (let i = 0; i < count; i++) {
          if (hiddenTime[i] > 0) continue;
          const i3 = i * 3;
          const wx = arr[i3] - origin.x;
          const wy = arr[i3 + 1] - origin.y;
          const wz = arr[i3 + 2] - origin.z;
          const t = wx * dir.x + wy * dir.y + wz * dir.z;
          if (t < 1) continue;
          const ex = wx - t * dir.x;
          const ey = wy - t * dir.y;
          const ez = wz - t * dir.z;
          const tanSq = (ex * ex + ey * ey + ez * ez) / (t * t);
          if (tanSq < bestTanSq) {
            bestTanSq = tanSq;
            bestLayer = li;
            bestIndex = i;
          }
        }
      }

      if (bestLayer === -1) continue;

      const runtime = runtimes[bestLayer];
      const arr = pointsRefs.current[bestLayer]!.geometry.attributes.position
        .array as Float32Array;
      const b3 = bestIndex * 3;
      const sx = arr[b3];
      const sy = arr[b3 + 1];
      const sz = arr[b3 + 2];

      runtime.hiddenTime[bestIndex] = 4 + Math.random() * 2;
      hiddenCount.current++;
      runtime.offsets[b3] = 0;
      runtime.offsets[b3 + 1] = 0;
      runtime.offsets[b3 + 2] = 0;
      burstQueue.current.push({ x: sx, y: sy, z: sz });

      // Let the rover HUD know a star was actually destroyed (and where,
      // in screen coords, so it can pop the congrats bubble at the cursor).
      window.dispatchEvent(
        new CustomEvent("rover:starShatter", {
          detail: { clientX, clientY },
        }),
      );

      // Shockwave: ripple neighbors in both layers outward.
      const waveSq = SHATTER_WAVE_RADIUS * SHATTER_WAVE_RADIUS;
      for (let li = 0; li < runtimes.length; li++) {
        const layer = INTERACTIVE_LAYERS[li];
        const { offsets, hiddenTime } = runtimes[li];
        const orig = layer.positions;
        for (let i = 0; i < layer.count; i++) {
          if ((li === bestLayer && i === bestIndex) || hiddenTime[i] > 0) {
            continue;
          }
          const i3 = i * 3;
          const nx = orig[i3] - sx;
          const ny = orig[i3 + 1] - sy;
          const nz = orig[i3 + 2] - sz;
          const dSq = nx * nx + ny * ny + nz * nz;
          if (dSq >= waveSq || dSq < 1e-6) continue;
          const d = Math.sqrt(dSq);
          const push = (1 - d / SHATTER_WAVE_RADIUS) * 1.2 / d;
          offsets[i3] += nx * push;
          offsets[i3 + 1] += ny * push;
          offsets[i3 + 2] += nz * push;
        }
      }
    }

    if (pointer.active) setLocalRay(pointer.x, pointer.y);

    // Mousemove events stop arriving when the cursor rests, so decay the
    // tracked speed here; scatter fades out within a few frames of stopping.
    pointer.speed *= Math.exp(-4 * dt);
    const speedFactor = Math.min(
      1,
      Math.max(
        0,
        (pointer.speed - SCATTER_SPEED_MIN) /
          (SCATTER_SPEED_MAX - SCATTER_SPEED_MIN),
      ),
    );
    const scattering = pointer.active && speedFactor > 0;

    const decay = Math.exp(-3 * dt);
    const radiusSq = SCATTER_RADIUS * SCATTER_RADIUS;
    let maxSq = 0;

    for (let li = 0; li < runtimes.length; li++) {
      const points = pointsRefs.current[li];
      if (!points) continue;
      const layer = INTERACTIVE_LAYERS[li];
      const { offsets, hiddenTime } = runtimes[li];
      const orig = layer.positions;
      const pos = points.geometry.attributes.position;
      const arr = pos.array as Float32Array;

      for (let i = 0; i < layer.count; i++) {
        const i3 = i * 3;

        if (hiddenTime[i] > 0) {
          hiddenTime[i] -= dt;
          if (hiddenTime[i] > 0) {
            arr[i3] = FAR_AWAY;
            arr[i3 + 1] = FAR_AWAY;
            arr[i3 + 2] = FAR_AWAY;
            continue;
          }
          // Re-form with a scatter offset the decay below eases back to zero.
          hiddenCount.current--;
          offsets[i3] = (Math.random() - 0.5) * 3;
          offsets[i3 + 1] = (Math.random() - 0.5) * 3;
          offsets[i3 + 2] = (Math.random() - 0.5) * 3;
        }

        const px = orig[i3];
        const py = orig[i3 + 1];
        const pz = orig[i3 + 2];

        if (scattering) {
          const wx = px - origin.x;
          const wy = py - origin.y;
          const wz = pz - origin.z;
          const t = wx * dir.x + wy * dir.y + wz * dir.z;
          if (t > 0) {
            const ex = wx - t * dir.x;
            const ey = wy - t * dir.y;
            const ez = wz - t * dir.z;
            const distSq = ex * ex + ey * ey + ez * ez;
            if (distSq < radiusSq) {
              const dist = Math.sqrt(distSq);
              const falloff = 1 - dist / SCATTER_RADIUS;
              const push =
                (speedFactor * SCATTER_STRENGTH * falloff * dt) /
                Math.max(dist, 0.5);
              offsets[i3] +=
                ex * push +
                (Math.random() - 0.5) * SCATTER_JITTER * speedFactor * dt;
              offsets[i3 + 1] +=
                ey * push +
                (Math.random() - 0.5) * SCATTER_JITTER * speedFactor * dt;
              offsets[i3 + 2] += ez * push;
            }
          }
        }

        offsets[i3] *= decay;
        offsets[i3 + 1] *= decay;
        offsets[i3 + 2] *= decay;

        arr[i3] = px + offsets[i3];
        arr[i3 + 1] = py + offsets[i3 + 1];
        arr[i3 + 2] = pz + offsets[i3 + 2];

        const offSq =
          offsets[i3] * offsets[i3] +
          offsets[i3 + 1] * offsets[i3 + 1] +
          offsets[i3 + 2] * offsets[i3 + 2];
        if (offSq > maxSq) maxSq = offSq;
      }

      pos.needsUpdate = true;
    }

    needsAnotherFrame.current = maxSq > SCATTER_EPSILON_SQ;
  });

  return (
    <>
      {INTERACTIVE_LAYERS.map((layer, li) => (
        <points
          key={li}
          ref={(el) => {
            pointsRefs.current[li] = el;
          }}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[runtimeRef.current![li].positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            map={texture}
            size={layer.size}
            color={isDarkMode ? "#bfdbfe" : "#475569"}
            sizeAttenuation
            transparent
            depthWrite={false}
            blending={isDarkMode ? AdditiveBlending : NormalBlending}
            opacity={isDarkMode ? layer.darkOpacity : layer.lightOpacity}
          />
        </points>
      ))}
    </>
  );
}

const BURST_POOL = 4;
const FRAGMENTS = 16;
const FRAGMENT_SIZE = 0.26;

type BurstSlot = {
  active: boolean;
  age: number;
  life: number;
  originX: number;
  originY: number;
  originZ: number;
  velocities: Float32Array;
};

// Fragment bursts for shattered stars. Lives inside the Drift group so its
// coordinates match the star layers that queue the bursts.
function ShatterBursts({
  burstQueue,
  texture,
}: {
  burstQueue: BurstQueueRef;
  texture: CanvasTexture;
}) {
  const { isDarkMode } = useTheme();
  const pointsRefs = useRef<(Points | null)[]>([]);
  const arraysRef = useRef<Float32Array[]>(null);
  arraysRef.current ??= Array.from(
    { length: BURST_POOL },
    () => new Float32Array(FRAGMENTS * 3),
  );
  const slots = useRef<BurstSlot[]>(
    Array.from({ length: BURST_POOL }, () => ({
      active: false,
      age: 0,
      life: 1,
      originX: 0,
      originY: 0,
      originZ: 0,
      velocities: new Float32Array(FRAGMENTS * 3),
    })),
  );

  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.05);

    while (burstQueue.current.length > 0) {
      const slotIndex = slots.current.findIndex((s) => !s.active);
      if (slotIndex === -1) {
        burstQueue.current.splice(0);
        break;
      }
      const burst = burstQueue.current.shift()!;
      const slot = slots.current[slotIndex];
      const points = pointsRefs.current[slotIndex];
      if (!points) continue;

      slot.active = true;
      slot.age = 0;
      slot.life = 1 + Math.random() * 0.3;
      slot.originX = burst.x;
      slot.originY = burst.y;
      slot.originZ = burst.z;
      for (let f = 0; f < FRAGMENTS; f++) {
        // Random direction on a sphere, random speed.
        const theta = Math.random() * Math.PI * 2;
        const cosPhi = Math.random() * 2 - 1;
        const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);
        const speed = 1.5 + Math.random() * 3.5;
        const f3 = f * 3;
        slot.velocities[f3] = Math.cos(theta) * sinPhi * speed;
        slot.velocities[f3 + 1] = Math.sin(theta) * sinPhi * speed;
        slot.velocities[f3 + 2] = cosPhi * speed;
      }
      points.visible = true;
    }

    for (let i = 0; i < BURST_POOL; i++) {
      const slot = slots.current[i];
      if (!slot.active) continue;
      const points = pointsRefs.current[i];
      if (!points) continue;

      slot.age += dt;
      if (slot.age >= slot.life) {
        slot.active = false;
        points.visible = false;
        continue;
      }

      const progress = slot.age / slot.life;
      const travel = slot.age * (1 - 0.3 * progress);
      const arr = points.geometry.attributes.position
        .array as Float32Array;
      for (let f = 0; f < FRAGMENTS; f++) {
        const f3 = f * 3;
        arr[f3] = slot.originX + slot.velocities[f3] * travel;
        arr[f3 + 1] = slot.originY + slot.velocities[f3 + 1] * travel;
        arr[f3 + 2] = slot.originZ + slot.velocities[f3 + 2] * travel;
      }
      points.geometry.attributes.position.needsUpdate = true;

      const material = points.material as PointsMaterial;
      material.opacity =
        Math.pow(1 - progress, 1.2) * (isDarkMode ? 0.95 : 0.65);
      material.size = FRAGMENT_SIZE * (1 - 0.4 * progress);
    }
  });

  return (
    <>
      {Array.from({ length: BURST_POOL }, (_, i) => (
        <points
          key={i}
          ref={(el) => {
            pointsRefs.current[i] = el;
          }}
          visible={false}
          frustumCulled={false}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[arraysRef.current![i], 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            map={texture}
            size={FRAGMENT_SIZE}
            color={isDarkMode ? "#bfdbfe" : "#475569"}
            sizeAttenuation
            transparent
            depthWrite={false}
            blending={isDarkMode ? AdditiveBlending : NormalBlending}
            opacity={0}
          />
        </points>
      ))}
    </>
  );
}

function Drift({
  children,
  pointerNdc,
}: {
  children: React.ReactNode;
  pointerNdc: NdcRef;
}) {
  const groupRef = useRef<Group>(null);
  const currentRotation = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!groupRef.current) return;
    // Slow continuous ambient drift: two out-of-phase sines keep the field
    // visibly moving without ever landing on a still frame. Bounded (unlike
    // the original endless accumulation) so the star slab can never rotate
    // edge-on and empty one side of the sky. Peak angular speed ≈0.013 rad/s
    // — a hair slower than the original 0.02.
    const t = state.clock.elapsedTime;
    const swayY =
      Math.sin(t * 0.03) * 0.35 + Math.sin(t * 0.017 + 1.3) * 0.12;
    const swayX = Math.sin(t * 0.022 + 2.1) * 0.10;

    const pointer = pointerNdc.current;
    // Normalized pointer (-1 to 1) steers a gentle parallax; three.js NDC has
    // y up, the old parallax expected y down, hence the negation.
    const targetX = swayX + (pointer.active ? -pointer.y * 0.08 : 0);
    const targetY = swayY + (pointer.active ? pointer.x * 0.08 : 0);

    // Small first-order lag: enough to smooth the pointer parallax without
    // muffling the ambient sway (its period is 200s+ so the lag barely bites).
    const smoothFactor = 0.02;
    currentRotation.current.x +=
      (targetX - currentRotation.current.x) * smoothFactor;
    currentRotation.current.y +=
      (targetY - currentRotation.current.y) * smoothFactor;

    groupRef.current.rotation.x = currentRotation.current.x;
    groupRef.current.rotation.y = currentRotation.current.y;
  });

  return <group ref={groupRef}>{children}</group>;
}

function Scene({
  pointerNdc,
  clickQueue,
}: {
  pointerNdc: NdcRef;
  clickQueue: ClickQueueRef;
}) {
  const texture = useMemo(() => makeStarTexture(), []);
  const burstQueue = useRef<{ x: number; y: number; z: number }[]>([]);

  return (
    <Drift pointerNdc={pointerNdc}>
      <StarLayer layer={LAYERS[0]} texture={texture} />
      <InteractiveStars
        texture={texture}
        pointerNdc={pointerNdc}
        clickQueue={clickQueue}
        burstQueue={burstQueue}
      />
      {!prefersReducedMotion && (
        <ShatterBursts burstQueue={burstQueue} texture={texture} />
      )}
    </Drift>
  );
}

const Hero3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { inView, tabVisible } = useHeroActive(containerRef);
  const pointerNdc = useRef({ x: 0, y: 0, active: false, speed: 0 });
  const clickQueue = useRef<{ x: number; y: number }[]>([]);

  const frameloop = prefersReducedMotion
    ? "demand"
    : inView && tabVisible
      ? "always"
      : "never";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const toNdc = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / rect.width) * 2 - 1,
        y: -(((clientY - rect.top) / rect.height) * 2 - 1),
      };
    };

    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const ndc = toNdc(event.clientX, event.clientY);
      const pointer = pointerNdc.current;

      // Smoothed cursor speed in NDC units/second — the scatter effect only
      // reacts to fast sweeps, so deliberate aiming leaves stars in place.
      if (lastTime > 0) {
        const dtm = Math.max((event.timeStamp - lastTime) / 1000, 0.001);
        const instant =
          Math.hypot(ndc.x - lastX, ndc.y - lastY) / dtm;
        pointer.speed = Math.min(4, pointer.speed * 0.7 + instant * 0.3);
      }
      lastX = ndc.x;
      lastY = ndc.y;
      lastTime = event.timeStamp;

      pointer.x = ndc.x;
      pointer.y = ndc.y;
      pointer.active =
        ndc.x >= -1 && ndc.x <= 1 && ndc.y >= -1 && ndc.y <= 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Clicks on the hero background shatter the star under the cursor;
    // clicks that land on real controls (links, buttons) are left alone.
    // The client coords ride along so the RoverStrip HUD can pop its
    // congrats bubble right at the cursor when a hit lands.
    const section = container.closest("section");
    const handleClick = (event: MouseEvent) => {
      if (prefersReducedMotion) return;
      if ((event.target as HTMLElement).closest("a, button")) return;
      const ndc = toNdc(event.clientX, event.clientY);
      clickQueue.current.push({
        x: ndc.x,
        y: ndc.y,
        clientX: event.clientX,
        clientY: event.clientY,
      });
    };

    section?.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      section?.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="absolute inset-0 h-full w-full"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        style={{ background: "transparent" }}
        frameloop={frameloop}
      >
        <Scene pointerNdc={pointerNdc} clickQueue={clickQueue} />
      </Canvas>
    </motion.div>
  );
};

export default Hero3D;
