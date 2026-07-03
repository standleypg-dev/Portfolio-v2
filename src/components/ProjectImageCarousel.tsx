import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProjectLightbox from "./ProjectLightbox";
import type { ProjectImage } from "../data/projects";

interface Props {
  images: ProjectImage[];
  alt: string;
}

const AUTO_ADVANCE_MS = 5000;

const ProjectImageCarousel = ({ images, alt }: Props) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Orientation is known from the data, so consecutive portrait shots can be
  // paired up front; no need to preload every image to measure it.
  const slides = useMemo<ProjectImage[][]>(() => {
    const result: ProjectImage[][] = [];
    let i = 0;
    while (i < images.length) {
      if (images[i].portrait && images[i + 1]?.portrait) {
        result.push([images[i], images[i + 1]]);
        i += 2;
      } else {
        result.push([images[i]]);
        i += 1;
      }
    }
    return result;
  }, [images]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused || lightboxIndex !== null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [slides.length, isPaused, lightboxIndex]);

  if (slides.length === 0) return null;

  const goPrev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const goNext = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <div
      className="relative h-64 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-900/10 dark:bg-gray-800/60 dark:ring-white/10 sm:h-72"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 flex items-center justify-center gap-2 p-3 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {slide.map((image) => {
            const globalIndex = images.indexOf(image);
            return (
              <img
                key={image.src}
                src={image.src}
                alt={`${alt} screenshot ${globalIndex + 1}`}
                loading="lazy"
                decoding="async"
                onClick={() => setLightboxIndex(globalIndex)}
                className="h-full max-w-full cursor-zoom-in object-contain"
              />
            );
          })}
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {lightboxIndex !== null && (
        <ProjectLightbox
          images={images.map((image) => image.src)}
          alt={alt}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
};

export default ProjectImageCarousel;
