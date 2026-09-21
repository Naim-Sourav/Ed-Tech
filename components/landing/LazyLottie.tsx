import React, { Suspense, useEffect, useRef, useState } from "react";

/**
 * LazyLottie — renders a Lottie animation only when it scrolls near the
 * viewport, and only then downloads both the `lottie-react` player and the
 * animation JSON (each becomes its own async chunk). The landing page's
 * initial bundle therefore stays exactly as small as before the animations
 * were added, and Core Web Vitals are unaffected.
 *
 * - `load` is a dynamic import of the animation JSON, e.g.
 *     () => import("../../assets/lottie/learning.json")
 * - Respects `prefers-reduced-motion`: the first frame is shown, no playback.
 * - `className` sizes the box; the placeholder keeps the same box so there is
 *   no layout shift when the animation pops in.
 */

type LottieModule = typeof import("lottie-react");
const Player = React.lazy(() =>
  import("lottie-react").then((m: LottieModule) => ({ default: m.default }))
);

interface LazyLottieProps {
  load: () => Promise<{ default: object } | object>;
  className?: string;
  /** Accessible description of what the illustration shows. */
  label: string;
  loop?: boolean;
  /** Pixels before the viewport edge at which loading starts. */
  rootMargin?: string;
  /** Called after the JSON is ready — handy for fading in a wrapper. */
  onReady?: () => void;
}

export default function LazyLottie({
  load,
  className = "",
  label,
  loop = true,
  rootMargin = "320px",
  onReady,
}: LazyLottieProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [data, setData] = useState<object | null>(null);
  const [reduced, setReduced] = useState(false);

  // Start loading when the box is close to the viewport
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  // Fetch the JSON chunk once we are near
  useEffect(() => {
    if (!near || data) return;
    let cancelled = false;
    load()
      .then((mod) => {
        if (cancelled) return;
        const json = (mod as { default?: object }).default ?? mod;
        setData(json);
        onReady?.();
      })
      .catch(() => {
        /* keep the placeholder — decorative only */
      });
    return () => {
      cancelled = true;
    };
  }, [near, data, load, onReady]);

  // Honour reduced-motion preferences (static first frame)
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`} role="img" aria-label={label}>
      {data ? (
        <Suspense fallback={null}>
          <Player
            animationData={data}
            loop={loop && !reduced}
            autoplay={!reduced}
            className="h-full w-full"
            rendererSettings={{ preserveAspectRatio: "xMidYMid meet", progressiveLoad: true }}
          />
        </Suspense>
      ) : (
        <div
          aria-hidden="true"
          className="h-full w-full animate-pulse rounded-[28px] bg-[radial-gradient(closest-side,rgba(255,82,0,0.08),transparent)]"
        />
      )}
    </div>
  );
}
