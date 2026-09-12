import React, { useMemo } from 'react';
import { sanitizeHtml } from '../utils/sanitize';

interface SafeHtmlProps {
  /** Untrusted HTML string (question / explanation / option). */
  html: string | null | undefined;
  /** Element to render. Defaults to 'div'. */
  as?: 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders untrusted HTML safely (DOMPurify-sanitized).
 * Always use this instead of raw dangerouslySetInnerHTML.
 */
const SafeHtml: React.FC<SafeHtmlProps> = ({ html, as = 'div', className, style }) => {
  const clean = useMemo(() => sanitizeHtml(html), [html]);
  const Tag = as as any;
  return <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: clean }} />;
};

export default SafeHtml;
