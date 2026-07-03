import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

interface Sparkle {
  x: number;
  y: number;
  size: number;
  id: number;
}

// Throttled emission keeps the effect a quiet shimmer instead of a comet
// trail, and bounds how much state churn a fast mouse can cause.
const EMIT_INTERVAL_MS = 50;
const LIFETIME_MS = 700;
const MAX_SPARKLES = 40;

const MouseSparkles = () => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const { isDarkMode } = useTheme();
  const lastEmit = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const hero = document.querySelector("#home");

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const point = e instanceof MouseEvent ? e : e.touches[0];
      if (!point) return;

      const now = performance.now();
      if (now - lastEmit.current < EMIT_INTERVAL_MS) return;

      if (hero) {
        const rect = hero.getBoundingClientRect();
        const inHero =
          point.clientY >= rect.top &&
          point.clientY <= rect.bottom &&
          point.clientX >= rect.left &&
          point.clientX <= rect.right;
        if (!inHero) return;
      }

      lastEmit.current = now;
      const sparkle: Sparkle = {
        id: now + Math.random(),
        x: point.clientX + (Math.random() - 0.5) * 14,
        y: point.clientY + (Math.random() - 0.5) * 14,
        size: 3 + Math.random() * 3,
      };

      setSparkles((prev) => [...prev.slice(-(MAX_SPARKLES - 1)), sparkle]);
      window.setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== sparkle.id));
      }, LIFETIME_MS);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("touchmove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
    };
  }, []);

  const color = isDarkMode
    ? "rgba(147, 197, 253, 0.7)"
    : "rgba(37, 99, 235, 0.45)";

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute animate-sparkle rounded-full"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
            backgroundColor: color,
            boxShadow: `0 0 ${sparkle.size * 2}px ${color}`,
          }}
        />
      ))}
    </div>
  );
};

export default MouseSparkles;
