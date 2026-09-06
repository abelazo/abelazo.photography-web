import { test, expect } from '@playwright/test';
import { openTestGallery, TEST_GALLERY_ALTS } from './support';

// User story #19 — [4.2] Photo metadata / frontmatter.
//
// Acceptance criteria:
//   1. Schema supports per-photo alt text (required — enforced at build time).
//   2. Ordering is explicit (frontmatter list order), not filesystem-dependent.
//   3. Missing required alt text fails the build with a clear, actionable error.
//
// AC1 and AC2 are visitor-facing and are asserted below. AC3 is a build-time
// concern with no visitor-facing surface — it is covered by the schema unit
// tests in `src/content.config.test.ts` and the build-gate test in
// `src/content.build.test.ts`.
//
// The fixture gallery carries a per-photo `title` on its first two photos and
// none on the rest, so both the "present" and "absent" paths are covered.

test.describe('photo metadata', () => {
  test('AC1 — every photo in the grid has non-empty alt text', async ({ page }) => {
    await openTestGallery(page);

    const images = page.locator('.gallery-grid li img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt?.trim(), `photo ${i + 1} alt`).toBeTruthy();
    }
  });

  test('AC2 — photos render in frontmatter list order', async ({ page }) => {
    await openTestGallery(page);

    const alts = await page
      .locator('.gallery-grid li img')
      .evaluateAll((imgs) => imgs.map((img) => (img as HTMLImageElement).alt));
    expect(alts).toEqual(TEST_GALLERY_ALTS);
  });

  test('per-photo title, when set, is exposed as the link tooltip', async ({ page }) => {
    await openTestGallery(page);

    const links = page.locator('.gallery-grid li a');
    await expect(links.nth(0)).toHaveAttribute('title', 'Fotograma uno');
    await expect(links.nth(1)).toHaveAttribute('title', 'Fotograma dos');
    // Untitled photos carry no title attribute at all.
    await expect(links.nth(2)).not.toHaveAttribute('title', /.+/);
  });
});
