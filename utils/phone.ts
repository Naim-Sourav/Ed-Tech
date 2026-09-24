/**
 * Bangladeshi mobile number helpers.
 *
 * Students type numbers every which way — Bangla digits from a Bijoy/Avro
 * keyboard, "+880 17…" copied from WhatsApp, dashes, spaces. Everything is
 * normalised to the canonical 11-digit local form (`01XXXXXXXXX`) before it
 * is validated or stored, so the backend only ever sees one shape.
 */

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';

/** Bangla numerals → ASCII digits (other characters untouched). */
export const toAsciiDigits = (s: string): string =>
  s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));

/** ASCII digits → Bangla numerals (for display). */
export const toBanglaDigits = (s: string | number): string =>
  String(s).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);

/**
 * Canonicalise a typed phone number:
 *  - Bangla digits → ASCII
 *  - strip spaces, dashes, dots, parentheses
 *  - "+8801…" / "8801…" → "01…"
 *  - "1XXXXXXXXX" (10 digits, leading zero dropped) → "01…"
 */
export const normalizeBdPhone = (raw: string): string => {
  let n = toAsciiDigits(raw).replace(/[\s\-().]/g, '');
  if (n.startsWith('+')) n = n.slice(1);
  if (n.startsWith('880')) n = n.slice(3);
  if (n.length === 10 && n.startsWith('1')) n = '0' + n;
  return n;
};

/** Valid BD mobile: 11 digits, 013–019 operator prefix. */
export const isValidBdPhone = (n: string): boolean => /^01[3-9]\d{8}$/.test(n);

/** "01712345678" → "017 1234 5678" (display only). */
export const formatBdPhone = (n: string): string => {
  const d = normalizeBdPhone(n);
  if (!isValidBdPhone(d)) return n;
  return `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7)}`;
};
