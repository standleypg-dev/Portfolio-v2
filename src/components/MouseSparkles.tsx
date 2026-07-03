import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

interface Sparkle {
  x: number;
  y: number;
  size: number;
  color: string;
  id: number;
}

const MouseSparkles: React.FC = () => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [isEnabled] = useState(true);
  const { isDarkMode } = useTheme();
  const heroRef = useRef<HTMLElement | null>(null);

  const createSparkle = useCallback(
    (x: number, y: number) => {
      const hue = isDarkMode ? "210" : "200";
      const saturation = isDarkMode ? "100%" : "70%";
      const lightness = isDarkMode ? "60%" : "50%";
      const alpha = isDarkMode ? "0.6" : "0.4";

      return {
        id: Date.now() + Math.random(),
        x,
        y,
        size: 0.5 + Math.random() * 0.3,
        color: `hsla(${hue}, ${saturation}, ${lightness}, ${alpha})`,
      };
    },
    [isDarkMode]
  );

  useEffect(() => {
    if (!isEnabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Get reference to hero section
    heroRef.current = document.querySelector("#home");

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const event = e instanceof MouseEvent ? e : e.touches[0];
      // The container is fixed, so viewport coordinates are what we need.
      const x = event.clientX;
      const y = event.clientY;

      // Check if mouse is within hero section bounds
      if (heroRef.current) {
        const heroRect = heroRef.current.getBoundingClientRect();
        const isInHero =
          event.clientY >= heroRect.top &&
          event.clientY <= heroRect.bottom &&
          event.clientX >= heroRect.left &&
          event.clientX <= heroRect.right;

        if (isInHero) {
          const newSparkles = Array.from({ length: 2 }, () =>
            createSparkle(
              x + (Math.random() - 0.5) * 15,
              y + (Math.random() - 0.5) * 15
            )
          );

          setSparkles((prev) => [...prev, ...newSparkles]);

          setTimeout(() => {
            setSparkles((prev) =>
              prev.filter(
                (sparkle) => !newSparkles.find((s) => s.id === sparkle.id)
              )
            );
          }, 800);
        }
      }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
    };
  }, [isEnabled, createSparkle]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute animate-sparkle"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: `${sparkle.size}rem`,
            height: `${sparkle.size}rem`,
            backgroundColor: sparkle.color,
            boxShadow: `0 0 ${sparkle.size * 4}px ${sparkle.color}`,
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
};

export default MouseSparkles;
