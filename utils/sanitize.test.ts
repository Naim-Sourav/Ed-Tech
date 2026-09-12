import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './sanitize';

describe('sanitizeHtml', () => {
  it('returns empty string for nullish input', () => {
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
    expect(sanitizeHtml('')).toBe('');
  });

  it('strips script tags (XSS)', () => {
    const out = sanitizeHtml('<p>hello</p><script>alert(1)</script>');
    expect(out).not.toContain('<script>');
    expect(out).toContain('hello');
  });

  it('strips event-handler attributes', () => {
    const out = sanitizeHtml('<img src="x" onerror="alert(1)">');
    expect(out).not.toContain('onerror');
  });

  it('blocks javascript: URLs', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
    expect(out).not.toContain('javascript:');
  });

  it('keeps question-bank formatting (sub/sup/tables/images)', () => {
    const html = '<p>H<sub>2</sub>O + x<sup>2</sup></p><table><tr><td>১</td></tr></table><img src="https://x.test/q.png" alt="q">';
    const out = sanitizeHtml(html);
    expect(out).toContain('<sub>2</sub>');
    expect(out).toContain('<sup>2</sup>');
    expect(out).toContain('<table>');
    expect(out).toContain('src="https://x.test/q.png"');
  });
});
