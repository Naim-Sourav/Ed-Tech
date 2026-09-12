import { describe, it, expect } from 'vitest';
import { ADMIN_EMAILS, isAdminEmail } from './adminConfig';

describe('isAdminEmail', () => {
  it('accepts listed admins case-insensitively', () => {
    for (const email of ADMIN_EMAILS) {
      expect(isAdminEmail(email)).toBe(true);
      expect(isAdminEmail(email.toUpperCase())).toBe(true);
    }
  });

  it('rejects everyone else', () => {
    expect(isAdminEmail('student@gmail.com')).toBe(false);
    expect(isAdminEmail('')).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
  });

  it('rejects lookalike attack addresses', () => {
    expect(isAdminEmail(` ${ADMIN_EMAILS[0]} `)).toBe(false);
    expect(isAdminEmail(`${ADMIN_EMAILS[0]}.evil.com`)).toBe(false);
  });
});
