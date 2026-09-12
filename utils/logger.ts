/**
 * Central application logger.
 *
 * - debug/info/warn only print in development builds (silent in production).
 * - error always prints, and is the single place to plug in remote error
 *   reporting (Sentry/Crashlytics) later.
 *
 * Usage: `import { logger } from '../utils/logger'; logger.debug(...)`
 */

const isDev = ((): boolean => {
  try {
    // @ts-ignore - import.meta.env is provided by Vite/Vitest
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      if (typeof import.meta.env.DEV === 'boolean') return import.meta.env.DEV;
      // @ts-ignore
      if (typeof import.meta.env.PROD === 'boolean') return !import.meta.env.PROD;
    }
  } catch (_e) {
    // ignore — default to verbose
  }
  return true;
})();

export const logger = {
  debug: (...args: any[]): void => {
    if (isDev) console.log(...args);
  },
  info: (...args: any[]): void => {
    if (isDev) console.info(...args);
  },
  warn: (...args: any[]): void => {
    if (isDev) console.warn(...args);
  },
  error: (...args: any[]): void => {
    console.error(...args);
    // TODO(P1): forward to Sentry — reportError(error, context)
  },
};
