import { test, expect } from '@playwright/test';

/**
 * Issue #21 — reorder or remove a gallery.
 *
 * Acceptance criteria, from the visitor's point of view:
 *  1. Home-page order is driven by a frontmatter field (`order`), not by code.
 *  2. A gallery can be dropped from listings without deleting its files
 *     (`draft: true`).
 *  3. Both take effect with a frontmatter edit only.
 *
 * Criterion 2 is a production-build behaviour: `draft: true` hides a gallery
 * from `pnpm build` but keeps it visible in `astro dev`, which is the server
 * Playwright drives. It is covered instead by the `isListed` unit tests in
 * `src/lib/galleries.test.ts`. This spec covers 1 and 3.
 */
test.describe('curating the home page', () => {
  test('galleries list in frontmatter `order`, overriding date', async ({ page }) => {
    await page.goto('/');

    const hrefs = await page
      .locator('main article a')
      .evaluateAll((links) => links.map((a) => a.getAttribute('href')));

    // Shipped sample content:
    //   coastal-mornings — order: 1, date: 2026-02-14
    //   harbour-lights   — order: 2, date: 2026-05-30  (the newer gallery)
    // Sorting purely by date would put harbour-lights first; `order` puts
    // coastal-mornings first. Seeing that proves `order` drives the listing.
    const coastal = hrefs.indexOf('/galleries/coastal-mornings');
    const harbour = hrefs.indexOf('/galleries/harbour-lights');

    expect(coastal, 'coastal-mornings card is on the home page').toBeGreaterThanOrEqual(0);
    expect(harbour, 'harbour-lights card is on the home page').toBeGreaterThanOrEqual(0);
    expect(harbour, 'lower `order` lists first, regardless of the newer date').toBeGreaterThan(
      coastal,
    );
  });

  test('a non-featured gallery still lists — only `draft` removes it', async ({ page }) => {
    // harbour-lights ships with `featured: false`. `featured` controls a badge,
    // not listing membership: the home page lists every published gallery, so
    // the way to take one off the site is `draft: true`, not un-featuring it.
    await page.goto('/');

    const harbourCard = page.locator('main article', {
      has: page.locator('a[href="/galleries/harbour-lights"]'),
    });
    await expect(harbourCard).toBeVisible();
    await expect(harbourCard).not.toContainText('featured');

    const coastalCard = page.locator('main article', {
      has: page.locator('a[href="/galleries/coastal-mornings"]'),
    });
    await expect(coastalCard).toContainText('featured');
  });
});
