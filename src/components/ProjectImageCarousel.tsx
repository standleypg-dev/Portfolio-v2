import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProjectLightbox from "./ProjectLightbox";

interface Props {
  images: string[];
  alt: string;
}

const AUTO_ADVANCE_MS = 5000;

const ProjectImageCarousel = ({ images, alt }: Props) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [orientations, setOrientations] = useState<Record<string, "portrait" | "landscape">>({});

  useEffect(() => {
    let cancelled = false;
    images.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        setOrientations((prev) => ({
          ...prev,
          [src]: img.naturalHeight > img.naturalWidth ? "portrait" : "landscape",
        }));
      };
      img.src = src;
    });
    return () => {
      cancelled = true;
    };
  }, [images]);

  const slides = useMemo<string[][]>(() => {
    const result: string[][] = [];
    let i = 0;
    while (i < images.length) {
      const src = images[i];
      const isPortrait = orientations[src] === "portrait";
      const next = images[i + 1];
      const nextIsPortrait = next && orientations[next] === "portrait";
      if (isPortrait && nextIsPortrait) {
        result.push([src, next]);
        i += 2;
      } else {
        result.push([src]);
        i += 1;
      }
    }
    return result;
  }, [images, orientations]);

  useEffect(() => {
    if (index >= slides.length && slides.length > 0) {
      setIndex(0);
    }
  }, [slides.length, index]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused || lightboxIndex !== null) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [slides.length, isPaused, lightboxIndex]);

  if (slides.length === 0) return null;

  const goPrev = () =>
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  const goNext = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <div
      className="relative h-56 overflow-hidden bg-white dark:bg-gray-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 flex items-center justify-center gap-2 p-2 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {slide.map((src) => {
            const globalIndex = images.indexOf(src);
            return (
              <img
                key={src}
                src={src}
                alt={`${alt} screenshot ${globalIndex + 1}`}
                loading="lazy"
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
          images={images}
          alt={alt}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
};

export default ProjectImageCarousel;
