export const scrollToSection = (href: string) => {
  const element = document.querySelector(href);
  if (!element) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  element.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
};
