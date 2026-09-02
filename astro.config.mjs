// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://abelazo.photography',
  // @astrojs/sitemap walks the pages Astro actually emits, so draft galleries
  // (no built route — see `isListed` in src/lib/galleries.ts) never reach the
  // sitemap. `public/robots.txt` points crawlers at `/sitemap-index.xml`.
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
