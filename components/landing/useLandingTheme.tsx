import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type LandingTheme = "light" | "dark";

/* shared with the app theme (App.tsx reads/writes the same key) */
const STORAGE_KEY = "themeMode";

/** Which theme should the landing start in? (stored choice → system → light) */
function initialTheme(): LandingTheme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* private mode / storage disabled */
  }
  // "system" (or nothing stored) → follow the OS preference
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

interface LandingThemeValue {
  theme: LandingTheme;
  toggle: () => void;
}

const LandingThemeContext = createContext<LandingThemeValue>({
  theme: "light",
  toggle: () => {},
});

/**
 * Landing-page dark mode.
 *
 * While the landing is mounted the theme owns the `dark` class on <html> —
 * which is exactly the hook the rest of the app already uses for `dark:`
 * variants and for `ThemeColorManager`'s browser theme-color. The landing's own
 * colours come from the `html.dark .pk-landing:not(.dash)` layer in index.css.
 * Leaving the route hands the class back to whatever the app had before, so the
 * marketing theme can never bleed into the dashboard / exam screens.
 */
export function useLandingTheme(): LandingThemeValue {
  const [theme, setTheme] = useState<LandingTheme>(() => initialTheme());
  const chosenByUser = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    if (!chosenByUser.current) return; // don't rewrite "system" on first render
    try {
      // The app shell supports three modes (light | dark | system) but the
      // landing switch only has two. Writing the raw value used to destroy a
      // stored "system" preference permanently. If the chosen theme already
      // matches the OS, persist "system" so the app keeps following the OS.
      const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
      const matchesSystem = (theme === "dark") === systemDark;
      window.localStorage.setItem(STORAGE_KEY, matchesSystem ? "system" : theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = useCallback(() => {
    chosenByUser.current = true;
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return useMemo(() => ({ theme, toggle }), [theme, toggle]);
}

export function LandingThemeProvider({ children }: { children: ReactNode }) {
  const value = useLandingTheme();
  return <LandingThemeContext.Provider value={value}>{children}</LandingThemeContext.Provider>;
}

/** Read the landing theme from any landing section (Navbar, Footer …). */
export function useLandingThemeContext(): LandingThemeValue {
  return useContext(LandingThemeContext);
}
