import { TransitionEvent, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface Props {
  images: string[];
  alt: string;
  startIndex: number;
  onClose: () => void;
}

const ProjectLightbox = ({ images, alt, startIndex, onClose }: Props) => {
  const N = images.length;
  const useWrap = N > 1;
  // Layout: [last_clone, ...images, first_clone]. Canonical track positions: 1..N.
  // Positions 0 and N+1 are clones used for seamless wrap, then snapped back.
  const slides = useWrap ? [images[N - 1], ...images, images[0]] : images;
  const initialTrackIndex = useWrap ? startIndex + 1 : startIndex;

  const [trackIndex, setTrackIndex] = useState(initialTrackIndex);
  const [withTransition, setWithTransition] = useState(true);

  const goPrev = useCallback(() => {
    if (!useWrap) return;
    setWithTransition(true);
    setTrackIndex((i) => i - 1);
  }, [useWrap]);

  const goNext = useCallback(() => {
    if (!useWrap) return;
    setWithTransition(true);
    setTrackIndex((i) => i + 1);
  }, [useWrap]);

  const handleTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== "transform") return;
    if (trackIndex === N + 1) {
      // Slid into first_clone — snap back to the real first image
      setWithTransition(false);
      setTrackIndex(1);
    } else if (trackIndex === 0) {
      // Slid into last_clone — snap back to the real last image
      setWithTransition(false);
      setTrackIndex(N);
    }
  };

  useEffect(() => {
    if (withTransition) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setWithTransition(true));
    });
    return () => cancelAnimationFrame(id);
  }, [withTransition]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, goPrev, goNext]);

  const canonicalIndex = useWrap
    ? (trackIndex - 1 + N) % N
    : trackIndex;

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} image viewer`}
    >
      <div
        onTransitionEnd={handleTransitionEnd}
        className={`flex h-full w-full ${
          withTransition ? "transition-transform duration-300 ease-out" : ""
        }`}
        style={{ transform: `translateX(-${trackIndex * 100}%)` }}
      >
        {slides.map((src, i) => (
          <div
            key={i}
            className="flex h-full w-full flex-shrink-0 items-center justify-center"
          >
            <img
              src={src}
              alt={`${alt} screenshot ${i + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <X size={24} />
      </button>

      {useWrap && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next image"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
          >
            <ChevronRight size={28} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/70">
            {canonicalIndex + 1} / {N}
          </div>
        </>
      )}
    </div>,
    document.body,
  );
};

export default ProjectLightbox;
