import { useAuth as useAppAuth } from '../../contexts/AuthContext';

/*
 * Bridges the app-wide AuthContext to the shape the landing components
 * (Navbar / UserMenu, ported from premium-ed-tech-landing-page.zip) expect.
 *
 * The landing only ever renders for logged-out users, so the logged-in
 * branch is effectively dormant — kept for parity with the zip design.
 *
 * Tolerates a missing AuthProvider (returns a logged-out shape) so the
 * landing can also render in SSR/SEO contexts and tests.
 */
export interface BridgeProfile {
  name: string;
  track: string;
}

export function useAuth(): {
  user: import('firebase/auth').User | null;
  profile: BridgeProfile | null;
  loading: boolean;
  logOut: () => Promise<void>;
} {
  let ctx: ReturnType<typeof useAppAuth> | null = null;
  try {
    ctx = useAppAuth();
  } catch {
    ctx = null;
  }

  const currentUser = ctx?.currentUser ?? null;
  const profile: BridgeProfile | null = currentUser
    ? {
        name: currentUser.displayName || 'শিক্ষার্থী',
        track: (ctx?.extendedProfile as { target?: string } | null | undefined)?.target || 'HSC',
      }
    : null;

  return {
    user: currentUser,
    profile,
    loading: false,
    logOut: ctx?.logout ?? (async () => {}),
  };
}
