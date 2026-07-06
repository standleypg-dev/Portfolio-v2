import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUp } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useHeroActive } from "../../hooks/useHeroActive";
import {
  createRoverState,
  createTerrain,
  RIDE_HEIGHT,
  drawParticles,
  drawRover,
  drawTerrain,
  isRoverIdle,
  stepParticles,
  stepRover,
  type Particle,
  type RoverInput,
  type RoverLevel,
  type RoverPalette,
  type RoverState,
  type Terrain,
} from "./roverEngine";

// Rover progression: destroying every 5 stars unlocks the next stage
// (capped at Nova). Each level is a temporary booster that decays 1 step
// every 5 seconds, so it's a comeback loop, not a permanent power-up.
const STAGES: Array<{
  name: string;
  text: string;
  pip: string;
}> = [
  { name: "Standard", text: "text-gray-400 dark:text-gray-500", pip: "bg-gray-300 dark:bg-gray-600" },
  { name: "Scout", text: "text-sky-500 dark:text-sky-300", pip: "bg-sky-400" },
  { name: "Ranger", text: "text-emerald-500 dark:text-emerald-300", pip: "bg-emerald-400" },
  { name: "Vanguard", text: "text-violet-500 dark:text-violet-300", pip: "bg-violet-400" },
  { name: "Nova", text: "text-amber-500 dark:text-amber-300", pip: "bg-amber-400" },
];
// Destroyed stars go into a small fuel tank. Each star powers ~6 seconds
// of the current level, so a fast 20-star run stays at Nova for a while
// and coasts down level by level — quick enough that the visitor keeps
// engaging, slow enough that a short pause isn't punished. Standard
// (level 0) is the always-on baseline — nothing to decay when empty.
const STAR_DRAIN_MS = 6000;
const POPUP_MS = 2500;
// Bank size → level. Thresholds are the cumulative "in tank" counts.
const levelFromBank = (bank: number): RoverLevel => {
  if (bank >= 20) return 4;
  if (bank >= 15) return 3;
  if (bank >= 10) return 2;
  if (bank >= 5) return 1;
  return 0;
};
type Popup = {
  id: number;
  x: number;
  y: number;
  count: number;
  level: RoverLevel;
};

const prefersReducedMotion =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const DARK_PALETTE: RoverPalette = {
  terrain: "#0b1220",
  rim: "rgba(191,219,254,0.18)",
  speckle: "rgba(191,219,254,0.10)",
  body: "#cbd5e1",
  accent: "#60a5fa",
  wheel: "#475569",
  dust: "#93c5fd",
  exhaust: "#fdba74",
  headlight: "rgba(191,219,254,0.16)",
};

const LIGHT_PALETTE: RoverPalette = {
  terrain: "rgba(203,213,225,0.45)",
  rim: "rgba(100,116,139,0.30)",
  speckle: "rgba(100,116,139,0.18)",
  body: "#475569",
  accent: "#2563eb",
  wheel: "#334155",
  dust: "rgba(148,163,184,0.9)",
  exhaust: "rgba(249,115,22,0.85)",
  headlight: null,
};

const RoverStrip = () => {
  const { isDarkMode } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { inView, tabVisible } = useHeroActive(containerRef, 0.3);
  const [hintVisible, setHintVisible] = useState(!prefersReducedMotion);

  const coarsePointer = useMemo(
    () => window.matchMedia("(pointer: coarse)").matches,
    [],
  );

  const engine = useRef<{
    terrain: Terrain | null;
    state: RoverState | null;
    particles: Particle[];
    input: RoverInput;
    buffer: HTMLCanvasElement | null;
    rafId: number;
    running: boolean;
    lastTime: number;
  }>({
    terrain: null,
    state: null,
    particles: [],
    input: { left: false, right: false, thrust: false, down: false },
    buffer: null,
    rafId: 0,
    running: false,
    lastTime: 0,
  });

  const paletteRef = useRef(isDarkMode ? DARK_PALETTE : LIGHT_PALETTE);
  const activeRef = useRef(true);
  const ensureRunningRef = useRef<() => void>(() => {});

  // The rover HUD (level, bank) is driven by shatter events from Hero3D.
  // The bank is the "fuel tank" — every star adds 1, every 10s consumes
  // 1. React state mirrors it for rendering; the ref is the write path
  // for listeners and intervals without stale closures.
  const meta = useRef({
    bank: 0,
    level: 0 as RoverLevel,
  });
  const [level, setLevel] = useState<RoverLevel>(0);
  const [bank, setBank] = useState(0);
  const [popup, setPopup] = useState<Popup | null>(null);

  useEffect(() => {
    paletteRef.current = isDarkMode ? DARK_PALETTE : LIGHT_PALETTE;
  }, [isDarkMode]);

  useEffect(() => {
    activeRef.current = inView && tabVisible;
  }, [inView, tabVisible]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const e = engine.current;
    const ctx = canvas.getContext("2d")!;

    const drawFrame = () => {
      if (!e.terrain || !e.state || !e.buffer) return;
      ctx.clearRect(0, 0, e.terrain.width, e.terrain.height);
      ctx.drawImage(
        e.buffer,
        0,
        e.terrain.stripTop,
        e.terrain.width,
        e.terrain.stripHeight,
      );
      drawParticles(ctx, e.particles, paletteRef.current);
      drawRover(ctx, e.state, e.terrain, paletteRef.current);
    };

    const rebuildBuffer = () => {
      if (!e.terrain) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      if (!e.buffer) e.buffer = document.createElement("canvas");
      e.buffer.width = e.terrain.width * dpr;
      e.buffer.height = e.terrain.stripHeight * dpr;
      const bctx = e.buffer.getContext("2d")!;
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawTerrain(bctx, e.terrain, paletteRef.current);
    };

    const tick = (time: number) => {
      if (!e.terrain || !e.state || !activeRef.current) {
        e.running = false;
        return;
      }
      const dt = Math.min((time - e.lastTime) / 1000, 0.05);
      e.lastTime = time;

      stepRover(e.state, e.input, e.terrain, e.particles, dt);
      stepParticles(e.particles, dt);
      drawFrame();

      if (isRoverIdle(e.state, e.input, e.particles)) {
        e.running = false;
        return;
      }
      e.rafId = requestAnimationFrame(tick);
    };

    ensureRunningRef.current = () => {
      if (e.running || prefersReducedMotion || !activeRef.current) return;
      e.running = true;
      e.lastTime = performance.now();
      e.rafId = requestAnimationFrame(tick);
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const stripHeight = Math.max(rect.height * 0.15, 112);
      e.terrain = createTerrain(rect.width, rect.height, stripHeight);
      if (!e.state) {
        // First mount: drop the rover in from off-screen so a fresh
        // visitor notices it (and understands the hero is interactive).
        // Reduced-motion visitors still get a parked rover instead.
        e.state = createRoverState(
          e.terrain,
          prefersReducedMotion ? "ground" : "sky",
        );
        if (!prefersReducedMotion) ensureRunningRef.current();
      } else {
        e.state.x = Math.min(e.state.x, rect.width - 1);
        const groundY = e.terrain.heightAt(e.state.x) - RIDE_HEIGHT;
        if (e.state.onGround) e.state.y = groundY;
        else e.state.y = Math.min(e.state.y, groundY);
      }
      rebuildBuffer();
      drawFrame();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(e.rafId);
      e.running = false;
    };
  }, []);

  // Theme switch: regenerate the terrain buffer and repaint the still frame.
  useEffect(() => {
    const e = engine.current;
    if (!e.terrain || !e.buffer || !canvasRef.current) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const bctx = e.buffer.getContext("2d")!;
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawTerrain(bctx, e.terrain, paletteRef.current);
    const ctx = canvasRef.current.getContext("2d")!;
    if (e.state) {
      ctx.clearRect(0, 0, e.terrain.width, e.terrain.height);
      ctx.drawImage(
        e.buffer,
        0,
        e.terrain.stripTop,
        e.terrain.width,
        e.terrain.stripHeight,
      );
      drawParticles(ctx, e.particles, paletteRef.current);
      drawRover(ctx, e.state, e.terrain, paletteRef.current);
    }
  }, [isDarkMode]);

  const press = useCallback((key: "left" | "right" | "thrust" | "down") => {
    engine.current.input[key] = true;
    ensureRunningRef.current();
    setHintVisible(false);
  }, []);

  const release = useCallback((key: "left" | "right" | "thrust" | "down") => {
    engine.current.input[key] = false;
  }, []);

  // Shatter → level-up: each destroyed star bumps the counter; every 5th
  // one (5, 10, 15, 20, 25, …) raises the rover a stage up to Nova. The
  // congrats bubble pops right at the cursor for direct feedback.
  useEffect(() => {
    if (prefersReducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    const onShatter = (event: Event) => {
      const detail = (event as CustomEvent).detail as {
        clientX: number;
        clientY: number;
      };
      meta.current.bank += 1;
      const newBank = meta.current.bank;
      setBank(newBank);

      const newLevel = levelFromBank(newBank);
      if (newLevel === meta.current.level) return;

      const leveledUp = newLevel > meta.current.level;
      meta.current.level = newLevel;
      setLevel(newLevel);
      if (engine.current.state) engine.current.state.level = newLevel;
      ensureRunningRef.current();

      if (leveledUp) {
        const rect = container.getBoundingClientRect();
        setPopup({
          id: Date.now() + Math.random(),
          x: detail.clientX - rect.left,
          y: detail.clientY - rect.top,
          count: newBank,
          level: newLevel,
        });
      }
    };
    window.addEventListener("rover:starShatter", onShatter);
    return () => window.removeEventListener("rover:starShatter", onShatter);
  }, []);

  // Auto-dismiss the popup after a short read.
  useEffect(() => {
    if (!popup) return;
    const id = window.setTimeout(() => setPopup(null), POPUP_MS);
    return () => window.clearTimeout(id);
  }, [popup]);

  // Drain the tank on a fixed 10s cadence so each destroyed star maps
  // cleanly to ten real seconds of fuel — bursts of destroys stack the
  // schedule predictably instead of resetting it every time. The tick
  // is a no-op when the tank is empty, so an idle Standard rover is free.
  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = window.setInterval(() => {
      if (meta.current.bank <= 0) return;
      meta.current.bank -= 1;
      setBank(meta.current.bank);
      const newLevel = levelFromBank(meta.current.bank);
      if (newLevel === meta.current.level) return;
      meta.current.level = newLevel;
      if (engine.current.state) engine.current.state.level = newLevel;
      // If the rover was flying at level 4 with down held, stop the down
      // thrust once the ability is lost — the engine gates it too, but
      // release keeps input.down from lingering.
      if (newLevel < 4) engine.current.input.down = false;
      setLevel(newLevel);
    }, STAR_DRAIN_MS);
    return () => window.clearInterval(id);
  }, []);

  // Keyboard controls, active only while the hero is on screen.
  useEffect(() => {
    if (prefersReducedMotion) return;

    if (!inView || !tabVisible) {
      const input = engine.current.input;
      input.left = false;
      input.right = false;
      input.thrust = false;
      input.down = false;
      return;
    }

    const isTyping = () => {
      const el = document.activeElement;
      return (
        el instanceof HTMLElement &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTyping()) return;
      switch (event.code) {
        case "ArrowLeft":
        case "KeyA":
          press("left");
          break;
        case "ArrowRight":
        case "KeyD":
          press("right");
          break;
        case "KeyW":
          press("thrust");
          break;
        case "ArrowUp":
        case "Space":
          // Only steal scrolling keys from the page itself — a focused link
          // or button must still activate, and scrolling below the hero
          // stays intact.
          if (event.target === document.body) {
            event.preventDefault();
            press("thrust");
          }
          break;
        case "ArrowDown":
        case "KeyS":
          // Always swallow ArrowDown so accidental presses can't scroll
          // the page mid-play. At Nova (level 4) the same key becomes a
          // downward thrust — every other level treats it as a no-op.
          if (event.target === document.body) event.preventDefault();
          if (meta.current.level === 4) press("down");
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case "ArrowLeft":
        case "KeyA":
          release("left");
          break;
        case "ArrowRight":
        case "KeyD":
          release("right");
          break;
        case "KeyW":
        case "ArrowUp":
        case "Space":
          release("thrust");
          break;
        case "ArrowDown":
        case "KeyS":
          release("down");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [inView, tabVisible, press, release]);

  // Resume the loop if the hero scrolls back into view mid-motion; the
  // tick stops itself after one frame when the rover is already idle.
  useEffect(() => {
    if (inView && tabVisible) ensureRunningRef.current();
  }, [inView, tabVisible]);

  const buttonClass =
    "pointer-events-auto flex h-11 w-11 select-none items-center justify-center rounded-full border border-gray-900/15 bg-gray-900/5 text-gray-600 backdrop-blur-sm active:bg-gray-900/15 dark:border-white/15 dark:bg-white/5 dark:text-gray-300 dark:active:bg-white/15";

  const stage = STAGES[level];
  const hintText = coarsePointer
    ? level === 4
      ? "◀ ▶ steer · ▲ up · ▼ down"
      : "◀ ▶ drive · hold ▲ to fly"
    : level === 4
      ? "← → steer · ↑ up · ↓ down"
      : "← → drive · hold ↑ to fly";

  return (
    <>
      <div
        ref={containerRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>

      {/* Controls live in their own layer above the hero content (z-10) —
          on small screens the content column overlaps the bottom strip and
          would otherwise swallow the taps. */}
      {!prefersReducedMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20"
        >
          {/* Rover status banner — pinned to the bottom-left corner. It
              stays out of the way until the visitor destroys their first
              star, and disappears again once the tank fully drains. On
              mobile it lifts above the drive chevrons so it stays visible. */}
          <AnimatePresence>
            {bank > 0 && (
              <motion.div
                key="rover-status"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.35 }}
                className={`absolute left-4 ${
                  coarsePointer ? "bottom-16" : "bottom-4"
                } md:left-6`}
              >
                <div className="flex flex-col items-start gap-1 rounded-lg border border-gray-900/10 bg-white/55 px-2.5 py-1.5 backdrop-blur-sm dark:border-white/10 dark:bg-gray-900/45">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${stage.text}`}
                    >
                      {stage.name}
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 w-4 rounded-full transition-colors ${
                            i <= level
                              ? stage.pip
                              : "bg-gray-400/25 dark:bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-500/80 dark:text-gray-400/70">
                    {bank} {bank === 1 ? "star" : "stars"} in tank
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Congrats bubble anchored to the click point — pops, drifts up
              a little, fades out. Multiple triggers just replace the last. */}
          <AnimatePresence>
            {popup && (
              <motion.div
                key={popup.id}
                initial={{ opacity: 0, y: 8, scale: 0.85 }}
                animate={{ opacity: 1, y: -8, scale: 1 }}
                exit={{ opacity: 0, y: -34, scale: 0.9 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap text-center"
                style={{ left: popup.x, top: popup.y }}
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500 dark:text-amber-300 drop-shadow">
                  {popup.count} stars destroyed
                </div>
                <div
                  className={`text-sm font-bold drop-shadow ${STAGES[popup.level].text}`}
                >
                  ▲ {STAGES[popup.level].name} Rover
                  {popup.level === 4 && " ★"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: hintVisible ? 1 : 0 }}
            transition={{ duration: 0.6, delay: hintVisible ? 1.2 : 0 }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] tracking-wide text-gray-500/80 dark:text-blue-100/40"
          >
            {hintText}
          </motion.p>

          {coarsePointer && (
            <div className="absolute inset-x-0 bottom-3 flex items-end justify-between px-5">
              <div className="flex gap-3">
                <button
                  type="button"
                  tabIndex={-1}
                  className={buttonClass}
                  style={{ touchAction: "manipulation" }}
                  onPointerDown={(ev) => {
                    ev.preventDefault();
                    press("left");
                  }}
                  onPointerUp={() => release("left")}
                  onPointerCancel={() => release("left")}
                  onPointerLeave={() => release("left")}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  tabIndex={-1}
                  className={buttonClass}
                  style={{ touchAction: "manipulation" }}
                  onPointerDown={(ev) => {
                    ev.preventDefault();
                    press("right");
                  }}
                  onPointerUp={() => release("right")}
                  onPointerCancel={() => release("right")}
                  onPointerLeave={() => release("right")}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="flex gap-3">
                {level === 4 && (
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label="Down thrust"
                    className={buttonClass}
                    style={{ touchAction: "manipulation" }}
                    onPointerDown={(ev) => {
                      ev.preventDefault();
                      press("down");
                    }}
                    onPointerUp={() => release("down")}
                    onPointerCancel={() => release("down")}
                    onPointerLeave={() => release("down")}
                  >
                    <ArrowUp size={20} className="rotate-180" />
                  </button>
                )}
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Up thrust"
                  className={buttonClass}
                  style={{ touchAction: "manipulation" }}
                  onPointerDown={(ev) => {
                    ev.preventDefault();
                    press("thrust");
                  }}
                  onPointerUp={() => release("thrust")}
                  onPointerCancel={() => release("thrust")}
                  onPointerLeave={() => release("thrust")}
                >
                  <ArrowUp size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default RoverStrip;
