import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
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
  type RoverPalette,
  type RoverState,
  type Terrain,
} from "./roverEngine";

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
    input: { left: false, right: false, thrust: false },
    buffer: null,
    rafId: 0,
    running: false,
    lastTime: 0,
  });

  const paletteRef = useRef(isDarkMode ? DARK_PALETTE : LIGHT_PALETTE);
  const activeRef = useRef(true);
  const ensureRunningRef = useRef<() => void>(() => {});

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
        e.state = createRoverState(e.terrain);
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

  const press = useCallback((key: "left" | "right" | "thrust") => {
    engine.current.input[key] = true;
    ensureRunningRef.current();
    setHintVisible(false);
  }, []);

  const release = useCallback((key: "left" | "right" | "thrust") => {
    engine.current.input[key] = false;
  }, []);

  // Keyboard controls, active only while the hero is on screen.
  useEffect(() => {
    if (prefersReducedMotion) return;

    if (!inView || !tabVisible) {
      const input = engine.current.input;
      input.left = false;
      input.right = false;
      input.thrust = false;
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
          // Swallow it so an accidental press mid-play doesn't scroll the
          // page away; it has no rover action.
          if (event.target === document.body) event.preventDefault();
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
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: hintVisible ? 1 : 0 }}
            transition={{ duration: 0.6, delay: hintVisible ? 1.2 : 0 }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] tracking-wide text-gray-500/80 dark:text-blue-100/40"
          >
            {coarsePointer ? "◀ ▶ drive · hold ▲ to fly" : "← → drive · hold ↑ to fly"}
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
              <button
                type="button"
                tabIndex={-1}
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
          )}
        </div>
      )}
    </>
  );
};

export default RoverStrip;
