import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";

/*
 * Global "login success" celebration — the animated conic-ring checkmark from
 * premium-ed-tech-landing-page.zip (src/components/auth/AuthPage.tsx “Success
 * overlay”). Rendered at the app root so it survives the /auth -> /dashboard
 * redirect: AuthPage dispatches `notifyAuthSuccess()` the moment sign-in
 * resolves, and this overlay plays on top of whatever screen is underneath.
 */

const CONIC =
  "conic-gradient(from 140deg, #ff5200 0%, #ffb92e 42%, #ff7a35 78%, #ff5200 100%)";

const EASE_SPRING = [0.34, 1.56, 0.64, 1] as [number, number, number, number];
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];

/** how long the celebration stays up (the app redirects underneath it) */
const VISIBLE_MS = 1700;

const EVENT = "pk:auth-success";

export const notifyAuthSuccess = (name?: string) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { name } }));
  }
};

const AuthSuccessOverlay: React.FC = () => {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let hideTimer: number | undefined;
    const onOk = (e: Event) => {
      const d = (e as CustomEvent<{ name?: string }>).detail;
      setName(d?.name?.trim() || "বন্ধু");
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setName(null), VISIBLE_MS);
    };
    window.addEventListener(EVENT, onOk);
    return () => {
      window.removeEventListener(EVENT, onOk);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {name && (
        <motion.div
          key="auth-success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[9999] grid place-items-center overflow-hidden bg-paper/80 backdrop-blur-md dark:bg-ink/80"
        >
          {/* warm brand glow behind the checkmark */}
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
            className="pointer-events-none absolute size-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(255,82,0,0.22),transparent)] blur-2xl"
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, filter: "blur(8px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: EASE_SPRING }}
            className="relative text-center"
          >
            <span className="relative mx-auto grid size-20 place-items-center">
              {/* pulse that rides out of the conic ring */}
              <motion.span
                aria-hidden="true"
                initial={{ opacity: 0.55, scale: 1 }}
                animate={{ opacity: 0, scale: 1.75 }}
                transition={{ delay: 0.35, duration: 1.1, ease: EASE_OUT_EXPO }}
                className="absolute inset-0 rounded-full"
                style={{ background: CONIC }}
              />
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, duration: 0.6, ease: EASE_SPRING }}
                className="relative grid size-20 place-items-center rounded-full text-white shadow-[0_20px_50px_-14px_rgba(255,82,0,0.6)]"
                style={{ background: CONIC }}
              >
                <Check className="h-9 w-9" strokeWidth={3.5} />
              </motion.span>
            </span>

            <h2 className="mt-6 font-bangla text-[30px] font-extrabold tracking-tight text-ink dark:text-paper">
              স্বাগতম, {name}!
            </h2>
            <p className="mt-1.5 text-[14.5px] font-medium text-mist">
              অঙ্গনে নিয়ে যাওয়া হচ্ছে…
            </p>

            {/* progress line — fills while the redirect underneath completes */}
            <span
              aria-hidden="true"
              className="mx-auto mt-4 block h-1 w-40 overflow-hidden rounded-full bg-ink/10 dark:bg-white/15"
            >
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.25, ease: "easeInOut" }}
                className="block h-full rounded-full bg-gradient-to-r from-brand-500 to-gold-400"
              />
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthSuccessOverlay;
