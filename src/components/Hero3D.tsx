import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdditiveBlending, CanvasTexture, Group, NormalBlending } from "three";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

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

function StarLayers() {
  const { isDarkMode } = useTheme();
  const texture = useMemo(() => makeStarTexture(), []);

  return (
    <>
      {LAYERS.map((layer, i) => (
        <points key={i}>
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
      ))}
    </>
  );
}

function Drift({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  const accumulatedY = useRef(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalized mouse position (-1 to 1) steers a gentle parallax.
      targetRotation.current = {
        x: (event.clientY / window.innerHeight) * 2 - 1,
        y: (event.clientX / window.innerWidth) * 2 - 1,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    accumulatedY.current += Math.min(delta, 0.05) * 0.02;

    const smoothFactor = 0.008;
    currentRotation.current.x +=
      (targetRotation.current.x * 0.08 - currentRotation.current.x) *
      smoothFactor;
    currentRotation.current.y +=
      (accumulatedY.current +
        targetRotation.current.y * 0.08 -
        currentRotation.current.y) *
      smoothFactor;

    groupRef.current.rotation.x = currentRotation.current.x;
    groupRef.current.rotation.y = currentRotation.current.y;
  });

  return <group ref={groupRef}>{children}</group>;
}

const Hero3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [frameloop, setFrameloop] = useState<"always" | "demand" | "never">(
    prefersReducedMotion ? "demand" : "always",
  );
  const isInViewport = useRef(true);
  const isTabVisible = useRef(true);

  const updateFrameloop = useCallback(() => {
    if (prefersReducedMotion) {
      setFrameloop("demand");
      return;
    }
    setFrameloop(
      isInViewport.current && isTabVisible.current ? "always" : "never",
    );
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewport.current = entry.isIntersecting;
        updateFrameloop();
      },
      { threshold: 0 },
    );

    if (containerRef.current) observer.observe(containerRef.current);

    const handleVisibilityChange = () => {
      isTabVisible.current = document.visibilityState === "visible";
      updateFrameloop();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [updateFrameloop]);

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
        <Drift>
          <StarLayers />
        </Drift>
      </Canvas>
    </motion.div>
  );
};

export default Hero3D;
