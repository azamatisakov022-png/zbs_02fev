import DOMPurify from 'dompurify'

/**
 * Sanitize HTML to prevent XSS attacks.
 * Allows safe HTML tags + SVG for inline icons.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li',
      'span', 'div', 'h1', 'h2', 'h3', 'h4',
      'svg', 'path', 'circle', 'rect', 'g', 'line', 'polyline', 'polygon',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'class', 'style',
      'd', 'fill', 'viewBox', 'xmlns', 'width', 'height',
      'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
      'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
      'points', 'none',
    ],
  })
}

/**
 * Escape HTML special characters for safe text interpolation.
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (ch) => map[ch])
}
