import { useEffect, useState, type RefObject } from "react";

// Shared visibility tracking so every hero animation loop (starfield, rover)
// pauses when the section scrolls away or the tab is hidden.
export function useHeroActive(
  ref: RefObject<HTMLElement | null>,
  threshold = 0,
) {
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold },
    );

    if (ref.current) observer.observe(ref.current);

    const handleVisibilityChange = () => {
      setTabVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [ref, threshold]);

  return { inView, tabVisible };
}
