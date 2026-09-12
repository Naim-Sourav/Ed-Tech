import DOMPurify from 'dompurify';

/**
 * Sanitize untrusted HTML (question text, explanations, options imported from
 * PDFs / AI / admins) before rendering it with dangerouslySetInnerHTML.
 *
 * Allows the formatting tags the question bank actually uses (sub/sup for
 * formulas, tables, images) while stripping scripts, event handlers
 * (onclick/onerror/...) and javascript: URLs.
 */
export const sanitizeHtml = (dirty: string | null | undefined): string => {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'span', 'div',
      'b', 'i', 'u', 'em', 'strong', 's', 'sub', 'sup', 'small', 'mark',
      'ul', 'ol', 'li',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img',
      'h1', 'h2', 'h3', 'h4',
      'blockquote', 'pre', 'code', 'hr',
    ],
    ALLOWED_ATTR: [
      'class', 'style', 'colspan', 'rowspan',
      'src', 'alt', 'width', 'height', 'loading',
      'href', 'target', 'rel',
    ],
    ALLOW_DATA_ATTR: false,
  });
};
