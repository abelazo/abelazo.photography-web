/**
 * Locale helpers for the ES/EN split.
 *
 * Routing: Spanish is the default and has no prefix (`/`, `/contact`,
 * `/galleries/<slug>`); English lives under `/en/`. URL path segments are
 * always English in both locales. This matches the
 * `i18n` block in `astro.config.mjs` (`prefixDefaultLocale: false`).
 *
 * For building localized links prefer `getRelativeLocaleUrl` from `astro:i18n`;
 * these helpers cover the two things it does not: reading the locale off a URL
 * and stripping the prefix back off a pathname.
 */
import { defaultLang, locales, ui, type Lang } from './ui';

/** The locale a pathname belongs to — `/en` or `/en/...` is English, else Spanish. */
export function getLangFromPath(pathname: string): Lang {
  const segment = pathname.split('/')[1];
  return (locales as string[]).includes(segment) && segment !== defaultLang
    ? (segment as Lang)
    : defaultLang;
}

/** Convenience wrapper for the common `Astro.url` case. */
export function getLangFromUrl(url: URL): Lang {
  return getLangFromPath(url.pathname);
}

/**
 * A pathname with any locale prefix removed and a leading slash kept:
 * `/en/galleries/moda` → `/galleries/moda`, `/en` → `/`, `/contact` → `/contact`.
 */
export function stripLocale(pathname: string): string {
  const parts = pathname.split('/');
  if ((locales as string[]).includes(parts[1]) && parts[1] !== defaultLang) {
    parts.splice(1, 1);
  }
  const rest = parts.join('/');
  return rest === '' ? '/' : rest;
}

/**
 * The same page in another locale. `/galleries/moda` + `en` → `/en/galleries/moda`;
 * `/en/contact` + `es` → `/contact`. Trailing slash of the input is preserved.
 */
export function localizePath(pathname: string, lang: Lang): string {
  const base = stripLocale(pathname);
  if (lang === defaultLang) return base;
  return base === '/' ? `/${lang}` : `/${lang}${base}`;
}

/** This locale's copy tree. Kept as a helper so callers do not import `ui` directly. */
export function t(lang: Lang) {
  return ui[lang];
}
