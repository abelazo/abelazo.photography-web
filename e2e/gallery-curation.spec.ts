import { test, expect } from '@playwright/test';

/**
 * Issue #21 — reorder or remove a gallery.
 *
 * Acceptance criteria, from the visitor's point of view:
 *  1. Listing order is driven by a frontmatter field (`order`), not by code.
 *  2. A gallery can be dropped from listings without deleting its files
 *     (`draft: true`).
 *  3. Both take effect with a frontmatter edit only.
 *
 * Criterion 2 is a production-build behaviour — `draft: true` hides a gallery
 * from `pnpm build` but keeps it in `astro dev`, the server Playwright drives —
 * so it is covered by the `isListed` unit tests in `src/lib/galleries.test.ts`
 * and, end-to-end, by `sitemap-robots.spec.ts` (drafts never reach the built
 * sitemap). This spec covers 1 and 3.
 *
 * Fixture frontmatter this relies on:
 *   test-gallery       — order: 5, date: 2020-06-15
 *   personal (sample)  — order: 10, date: 2026-09-01  (a much newer gallery)
 * Sorting purely by date would put `personal` first; `order` puts `test-gallery`
 * first. Seeing that proves `order` drives the listing.
 */
test.describe('curating the galleries listing', () => {
  test('galleries list in frontmatter `order`, overriding date', async ({ page }) => {
    await page.goto('/galleries');

    const hrefs = await page
      .locator('main ul li a')
      .evaluateAll((links) => links.map((a) => a.getAttribute('href')));

    const testGallery = hrefs.indexOf('/galleries/test-gallery');
    const personal = hrefs.indexOf('/galleries/personal');

    expect(testGallery, 'test-gallery is listed').toBeGreaterThanOrEqual(0);
    expect(personal, 'personal is listed').toBeGreaterThanOrEqual(0);
    expect(personal, 'lower `order` lists first, regardless of the newer date').toBeGreaterThan(
      testGallery,
    );
  });

  test('the same order drives the home-page taster grid', async ({ page }) => {
    await page.goto('/');
    const hrefs = await page
      .locator('#galleries ul li a')
      .evaluateAll((links) => links.map((a) => a.getAttribute('href')));

    expect(hrefs.indexOf('/galleries/personal')).toBeGreaterThan(
      hrefs.indexOf('/galleries/test-gallery'),
    );
  });
});
