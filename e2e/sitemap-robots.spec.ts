import { test, expect } from '@playwright/test';

/**
 * Issue #26 — [5.4] Sitemap and robots.
 *
 * Acceptance criteria, from a crawler's point of view:
 *  1. `sitemap.xml` auto-generated at build time and includes all published
 *     galleries and static pages, in both locales.
 *  2. `robots.txt` present, allows crawling, references the sitemap.
 *  3. Draft / unpublished galleries excluded from the sitemap.
 *
 * `@astrojs/sitemap` is an `astro:build:done` integration — it emits nothing
 * under `astro dev`. This spec therefore runs in the `<engine>-prod` projects
 * (see `playwright.config.ts`), which serve a real production build via
 * `astro preview`.
 *
 * Every sample gallery currently ships `draft: true`, so a production build has
 * no gallery-detail pages at all — which is exactly criterion 3's mechanism in
 * action (a draft gets no built page, so nothing for the sitemap to pick up).
 * The observable invariant asserted here: the gallery-detail URLs in the
 * sitemap are exactly the ones a visitor can reach from the home page — today,
 * none.
 */

const SITE = 'https://abelazo.photography';

/** `<loc>` values from a sitemap XML body. */
function locs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

/** A gallery-*detail* URL: `/galleries/<slug>/`, not the `/galleries/` index. */
const GALLERY_DETAIL = /\/galleries\/[^/]+\/$/;

test.describe('sitemap and robots', () => {
  test('sitemap is generated and lists the site pages', async ({ request }) => {
    const index = await request.get('/sitemap-index.xml');
    expect(index.ok()).toBe(true);
    expect(index.headers()['content-type']).toContain('xml');

    // The index points at one or more child sitemaps, all absolute URLs on the
    // configured `site`.
    const children = locs(await index.text());
    expect(children.length).toBeGreaterThan(0);
    for (const child of children) expect(child.startsWith(`${SITE}/`)).toBe(true);

    // Gather every URL across the child sitemaps.
    const urls: string[] = [];
    for (const child of children) {
      const res = await request.get(child.replace(SITE, ''));
      expect(res.ok()).toBe(true);
      urls.push(...locs(await res.text()));
    }

    // Home + static pages, both locales (URL segments are English in both).
    expect(urls).toContain(`${SITE}/`);
    expect(urls).toContain(`${SITE}/the-session/`);
    expect(urls).toContain(`${SITE}/contact/`);
    expect(urls).toContain(`${SITE}/galleries/`);
    expect(urls).toContain(`${SITE}/en/`);
    expect(urls).toContain(`${SITE}/en/the-session/`);
    // Every entry is an absolute URL on the configured site.
    for (const url of urls) expect(url.startsWith(`${SITE}/`)).toBe(true);
  });

  test('sitemap gallery pages match exactly the reachable galleries', async ({ request, page }) => {
    // What a visitor can reach: the gallery cards on the home page, in both
    // locales — the sitemap advertises gallery-detail pages for each.
    const onSite = new Set<string>();
    for (const home of ['/', '/en/']) {
      await page.goto(home);
      const hrefs = await page
        .locator('#galleries ul li a')
        .evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).getAttribute('href')));
      for (const href of hrefs) onSite.add(`${SITE}${href!.replace(/\/?$/, '/')}`);
    }

    // What the sitemap advertises as a gallery-detail page.
    const index = await request.get('/sitemap-index.xml');
    const inSitemap = new Set<string>();
    for (const child of locs(await index.text())) {
      const res = await request.get(child.replace(SITE, ''));
      for (const url of locs(await res.text())) {
        if (GALLERY_DETAIL.test(url)) inSitemap.add(url);
      }
    }

    // Exact match both ways: no published gallery missing, no draft leaked in.
    expect([...inSitemap].sort()).toEqual([...onSite].sort());
  });

  test('robots.txt allows crawling and points at the sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.ok()).toBe(true);
    expect(res.headers()['content-type']).toContain('text/plain');

    const body = await res.text();
    expect(body).toMatch(/^User-agent:\s*\*/m);
    expect(body).toMatch(/^Allow:\s*\/$/m);
    expect(body).not.toMatch(/^Disallow:\s*\/$/m);
    expect(body).toMatch(new RegExp(`^Sitemap:\\s*${SITE}/sitemap-index\\.xml$`, 'm'));
  });

  test('the sitemap URL in robots.txt actually serves the sitemap', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    const sitemapUrl = robots.match(/^Sitemap:\s*(\S+)$/m)?.[1];
    expect(sitemapUrl).toBeTruthy();

    const res = await request.get(sitemapUrl!.replace(SITE, ''));
    expect(res.ok()).toBe(true);
    expect(await res.text()).toContain('<sitemapindex');
  });
});
