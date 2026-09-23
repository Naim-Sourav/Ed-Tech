import { useEffect } from 'react';

/** One-shot confetti burst (brand colours); skipped for reduced-motion users and when `active` is false. */
export function useCelebration(active: boolean) {
  useEffect(() => {
    if (!active || typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;
    import('canvas-confetti')
      .then(({ default: confetti }) => {
        if (cancelled) return;
        const colors = ['#ff5200', '#ffb92e', '#ff7a35', '#059669', '#161210'];
        confetti({ particleCount: 80, spread: 70, origin: { x: 0.2, y: 0.55 }, colors, zIndex: 200 });
        confetti({ particleCount: 80, spread: 70, origin: { x: 0.8, y: 0.55 }, colors, zIndex: 200 });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [active]);
}
