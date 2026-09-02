import { test, expect } from '@playwright/test';

/**
 * Issue #26 — [5.4] Sitemap and robots.
 *
 * Acceptance criteria, from a crawler's point of view:
 *  1. `sitemap.xml` auto-generated at build time and includes all published
 *     galleries.
 *  2. `robots.txt` present, allows crawling, references the sitemap.
 *  3. Draft / unpublished galleries excluded from the sitemap.
 *
 * `@astrojs/sitemap` is an `astro:build:done` integration — it emits nothing
 * under `astro dev`. This spec therefore runs in the `chromium-prod` project
 * (see `playwright.config.ts`), which serves a real production build via
 * `astro preview`.
 *
 * Criterion 3 has no draft in the sample content to point at. The mechanism —
 * a `draft: true` gallery gets no built page, so nothing for the sitemap to
 * pick up — is unit-tested in `src/lib/galleries.test.ts` (`isListed`). Here we
 * assert the observable invariant instead: the galleries in the sitemap are
 * exactly the galleries a visitor can reach from the home page, no more.
 */

const SITE = 'https://abelazo.photography';

/** `<loc>` values from a sitemap XML body. */
function locs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

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

    expect(urls).toContain(`${SITE}/`);
    // Static pages are in.
    expect(urls).toContain(`${SITE}/about/`);
    expect(urls).toContain(`${SITE}/contact/`);
    // Every entry is an absolute URL on the configured site.
    for (const url of urls) expect(url.startsWith(`${SITE}/`)).toBe(true);
  });

  test('sitemap galleries match exactly the published galleries', async ({ request, page }) => {
    // What a visitor can reach: the gallery cards on the home page.
    await page.goto('/');
    const onSite = new Set(
      (
        await page
          .locator('main article a')
          .evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).getAttribute('href')))
      ).map((href) => `${SITE}${href!.replace(/\/?$/, '/')}`),
    );
    expect(onSite.size).toBeGreaterThan(0);

    // What the sitemap advertises under /galleries/.
    const index = await request.get('/sitemap-index.xml');
    const inSitemap = new Set<string>();
    for (const child of locs(await index.text())) {
      const res = await request.get(child.replace(SITE, ''));
      for (const url of locs(await res.text())) {
        if (url.includes('/galleries/')) inSitemap.add(url);
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
