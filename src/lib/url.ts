/**
 * Join a path onto a base URL, collapsing duplicate slashes between them.
 * Useful for building canonical/OG URLs from `Astro.site`.
 */
export function absoluteUrl(base: string | URL, path: string): string {
  const origin = (typeof base === 'string' ? base : base.href).replace(/\/+$/, '');
  const suffix = path.replace(/^\/+/, '');
  return suffix ? `${origin}/${suffix}` : origin;
}
