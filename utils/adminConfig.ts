/**
 * Central registry of admin e-mails.
 *
 * ⚠️ SECURITY NOTE — this list only controls what the UI *shows*.
 * Real authorization MUST ALSO be enforced:
 *   1. In `firestore.rules` → isAdmin() (same e-mails, see bottom of that file)
 *   2. In the backend API (Render service) — verify the Firebase ID token on
 *      every /admin/* request and check the caller's e-mail/role there.
 *
 * If you remove an e-mail here, remove it from firestore.rules too (and vice versa).
 */

// Keep in sync with firestore.rules → ADMIN_EMAILS
export const ADMIN_EMAILS: string[] = [
  "nurnaimsourav@gmail.com",
  "tasnimahmedutsha600@gmail.com",
];

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.some(
    (admin) => admin.toLowerCase() === email.toLowerCase()
  );
};
