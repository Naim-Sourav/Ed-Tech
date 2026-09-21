import { Link } from "react-router-dom";

/**
 * Porikkhangon brand mark — the app's own "P" glyph (white) with its orange
 * accent dot, on the landing design's black rounded tile.
 *
 * The mark lives in `public/p-logo-mark.png`, a transparent PNG cut from the
 * app's `Pshape.svg` artboard (the original SVG is masked *white*, so it is
 * invisible on the tile's black background when used as a plain <img>).
 */
export default function LogoMark({
  className = "size-10",
  tile = true,
}: {
  className?: string;
  /** `false` drops the black tile — use it on already-dark backgrounds (footer),
      where a black tile would simply blend in and read as an empty box. */
  tile?: boolean;
}) {
  const img = (
    <img
      src={`${import.meta.env.BASE_URL}p-logo-mark.png`}
      alt=""
      aria-hidden="true"
      draggable={false}
      className="h-full w-full object-contain"
    />
  );

  if (!tile) {
    return (
      <span
        className={`relative inline-grid place-items-center ${className}`}
        aria-label="পরীক্ষাঙ্গন লোগো"
        role="img"
      >
        {img}
      </span>
    );
  }

  return (
    <span
      className={`logo-tile relative inline-grid place-items-center overflow-hidden rounded-2xl bg-black p-[27%] shadow-lg shadow-brand-500/25 ${className}`}
      aria-label="পরীক্ষাঙ্গন লোগো"
      role="img"
    >
      {img}
    </span>
  );
}

/**
 * Full lockup (mark + wordmark) used where the landing Navbar/Footer lockup is
 * needed but the surrounding markup is not — e.g. the auth page header.
 * Links back to the public landing route.
 */
export function Logo({
  className = "size-11",
  to = "/",
  dark = false,
}: {
  className?: string;
  to?: string;
  dark?: boolean;
}) {
  return (
    <Link to={to} className="group flex items-center gap-2.5" aria-label="পরীক্ষাঙ্গন — হোম">
      <span className="transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105">
        <LogoMark className={className} />
      </span>
      <span className={`font-display text-2xl font-bold tracking-tight ${dark ? "text-white" : "text-ink-950"}`}>
        পরীক্ষা<span className="text-gradient">ঙ্গন</span>
      </span>
    </Link>
  );
}
