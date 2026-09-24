import { useEffect, type RefObject } from 'react';

/*
 * MathJax is loaded app-wide from index.html (deferred until the page is
 * idle) and only typesets the document once, when it arrives. Anything the
 * bank renders after that — questions fetched from the API, an explanation
 * that opens — has to ask for a typeset itself. This hook does that for one
 * element whenever `deps` change, waiting for MathJax if it is still loading.
 */

interface MathJaxLike {
  typesetPromise?: (elements?: Element[]) => Promise<unknown>;
}

const TEX_MARKERS = /\$|\\\(|\\\[|\\begin\{/;

/** True when the element still contains raw TeX (already typeset math has no delimiters left). */
export const hasRawTex = (el: Element): boolean => TEX_MARKERS.test(el.textContent || '');

const mathJax = (): MathJaxLike | undefined => (typeof window === 'undefined' ? undefined : (window as { MathJax?: MathJaxLike }).MathJax);

const RETRY_MS = 400;
const MAX_TRIES = 25; // ~10 s: MathJax is fetched from a CDN after `load` + idle

/** Typesets `el` (now, or as soon as MathJax is ready). Returns a cancel function. */
export const typesetMath = (el: Element): (() => void) => {
  let cancelled = false;
  let tries = 0;
  let timer: number | undefined;
  const attempt = () => {
    if (cancelled || !el.isConnected) return;
    const M = mathJax();
    if (M?.typesetPromise) {
      M.typesetPromise([el]).catch(() => {
        /* a broken formula must not break the page */
      });
      return;
    }
    if (++tries < MAX_TRIES) timer = window.setTimeout(attempt, RETRY_MS);
  };
  attempt();
  return () => {
    cancelled = true;
    if (timer !== undefined) window.clearTimeout(timer);
  };
};

/** Typeset the referenced element whenever `deps` change and it still holds raw TeX. */
export function useMathJax(ref: RefObject<Element | null>, deps: readonly unknown[]): void {
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasRawTex(el)) return undefined;
    return typesetMath(el);
  }, deps);
}
