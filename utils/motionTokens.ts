/**
 * Shared motion tokens.
 *
 * The landing sections (`components/landing/helpers.tsx`) and the dashboard
 * (`components/HomeDashboard.tsx`) each used to declare their own `EASE`
 * constant with different curves — [0.22, 1, 0.36, 1] vs [0.16, 1, 0.3, 1] —
 * plus different durations, so the two screens animated with visibly
 * different personalities. Both now import from here.
 */

/** Primary easing curve for entrances, reveals and hover lifts. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Canonical durations (seconds) for `motion` transitions. */
export const DURATION = {
  /** Small state flips — icon swaps, chips. */
  fast: 0.28,
  /** Default element entrance. */
  base: 0.6,
  /** Hero / section reveals. */
  slow: 0.9,
} as const;

/** Canonical Tailwind transition-duration classes, so hovers match across screens. */
export const TRANSITION_CLASS = {
  fast: 'duration-300',
  base: 'duration-500',
} as const;
