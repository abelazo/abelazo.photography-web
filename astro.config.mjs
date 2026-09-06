// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import { defaultLang, locales } from './src/i18n/ui';

// `{ es: 'es', en: 'en' }` — @astrojs/sitemap wants a locale→path-prefix map.
const sitemapLocales = Object.fromEntries(locales.map((code) => [code, code]));

// https://astro.build/config
export default defineConfig({
  site: 'https://abelazo.photography',
  // Bilingual: Spanish is the default and unprefixed (`/`, `/contact`,
  // `/galleries/<slug>`); English pages live under `/en/`. URL path segments
  // are always English in both locales. Copy lives in `src/i18n/ui.ts`;
  // locale helpers in `src/i18n/utils.ts`.
  i18n: {
    locales,
    defaultLocale: defaultLang,
    routing: { prefixDefaultLocale: false },
  },
  // @astrojs/sitemap walks the pages Astro actually emits, so draft galleries
  // (no built route — see `isListed` in src/lib/galleries.ts) never reach the
  // sitemap. It also reads the `i18n` block above to add `hreflang` alternates.
  // `public/robots.txt` points crawlers at `/sitemap-index.xml`.
  integrations: [sitemap({ i18n: { defaultLocale: defaultLang, locales: sitemapLocales } })],
  vite: {
    plugins: [tailwindcss()],
  },
});
