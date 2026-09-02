import { test, expect } from '@playwright/test';

// User story #19 — [4.2] Photo metadata / frontmatter.
//
// Acceptance criteria:
//   1. Schema supports per-photo alt text (required — enforced at build time).
//   2. Ordering is explicit (frontmatter list order), not filesystem-dependent.
//   3. Missing required alt text fails the build with a clear, actionable error.
//
// AC1 and AC2 are visitor-facing and are asserted below. AC3 is a build-time
// concern with no visitor-facing surface — it is covered by the schema unit
// tests in `src/content.config.test.ts` ("fails a missing alt with an
// actionable, photo-scoped message"), which assert the error path and message.
//
// `coastal-mornings` carries a per-photo `title` on its first two photos and
// none on the rest, so both the "present" and "absent" paths are covered.

/** Open the detail page whose <h1> matches `title`. */
async function openGallery(page: import('@playwright/test').Page, title: string) {
  await page.goto('/');
  await page
    .locator('main article')
    .filter({ has: page.getByRole('heading', { level: 2, name: title }) })
    .getByRole('link')
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
}

test.describe('photo metadata', () => {
  test('AC1 — every photo in the grid has non-empty alt text', async ({ page }) => {
    await openGallery(page, 'Coastal Mornings');

    const images = page.locator('.gallery-grid li img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt?.trim(), `photo ${i + 1} alt`).toBeTruthy();
    }
  });

  test('AC2 — photos render in frontmatter list order', async ({ page }) => {
    await openGallery(page, 'Coastal Mornings');

    // The order declared in src/content/galleries/coastal-mornings.md.
    const expectedOrder = [
      'A dark tide line curving across pale wet sand at dawn.',
      'Low grey cloud pressing down over a flat, calm sea.',
      'Ripples in wet sand catching soft overcast light.',
      'Warm first light breaking across the horizon over the water.',
      'A narrow rock pool holding still water between dark weed-covered rocks.',
      'Gulls scattered across a wide bank of wet sand under flat light.',
      'A steep headland dropping to the sea, seen end-on in soft haze.',
      'The outgoing tide draining in thin channels across a broad beach.',
      'Sea fret hanging over the beach at dawn, fine ripples and scattered shells across the wet sand.',
    ];

    const alts = await page
      .locator('.gallery-grid li img')
      .evaluateAll((imgs) => imgs.map((img) => (img as HTMLImageElement).alt));
    expect(alts).toEqual(expectedOrder);
  });

  test('per-photo title, when set, is exposed as the link tooltip', async ({ page }) => {
    await openGallery(page, 'Coastal Mornings');

    const links = page.locator('.gallery-grid li a');
    await expect(links.nth(0)).toHaveAttribute('title', 'Tide line, first light');
    await expect(links.nth(1)).toHaveAttribute('title', 'Low cloud over slack water');
    // Untitled photos carry no title attribute at all.
    await expect(links.nth(2)).not.toHaveAttribute('title', /.+/);
  });
});
