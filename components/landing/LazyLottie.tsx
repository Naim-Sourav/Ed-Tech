import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

type LottiePlayer = typeof import("lottie-react")["default"];

interface LazyLottieProps {
  /**
   * Dynamic import of the animation JSON, e.g.
   * `() => import("../../assets/lottie/hero-animation.json")`.
   * Keeping it a thunk lets Vite split every animation into its own chunk.
   */
  load: () => Promise<{ default: unknown }>;
  className?: string;
  /** Accessible name; omit for purely decorative artwork. */
  label?: string;
  loop?: boolean;
}

/**
 * Performance-friendly Lottie wrapper used by the landing page.
 *
 * Same animations as the original landing page, but:
 *  • the player (`lottie-react`) AND the JSON are only downloaded once the
 *    element scrolls near the viewport — the hero bundle stays lean;
 *  • honours `prefers-reduced-motion` (first frame is shown, no playback);
 *  • reserves its box up-front (square) so nothing shifts when it mounts.
 */
export default function LazyLottie({ load, className = "", label, loop = true }: LazyLottieProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "260px 0px 260px 0px" });
  const reduceMotion = useReducedMotion();
  const [ready, setReady] = useState<{ Lottie: LottiePlayer; data: unknown } | null>(null);

  useEffect(() => {
    if (!inView || ready) return;
    let alive = true;
    Promise.all([import("lottie-react"), load()])
      .then(([mod, json]) => {
        if (alive) setReady({ Lottie: mod.default, data: json.default });
      })
      .catch(() => {
        /* decorative — fail silently and keep the placeholder */
      });
    return () => {
      alive = false;
    };
  }, [inView, load, ready]);

  const Lottie = ready?.Lottie;

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {Lottie ? (
        <Lottie
          animationData={ready!.data}
          loop={loop}
          autoplay={!reduceMotion}
          rendererSettings={{ preserveAspectRatio: "xMidYMid meet", progressiveLoad: true }}
          className="h-full w-full"
        />
      ) : (
        <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(closest-side,rgba(255,185,46,0.22),transparent)] blur-2xl" />
      )}
    </div>
  );
}
