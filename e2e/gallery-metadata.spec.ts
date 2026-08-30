import { test, expect } from '@playwright/test';

// User story #10 — [2.4] Gallery detail page metadata.
// Acceptance criteria, mapped one-to-one to the tests below.
//
// Sample content: `coastal-mornings` carries location + tags, `harbour-lights`
// carries neither — so both the "present" and "absent" paths are covered.

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

test.describe('gallery detail page metadata', () => {
  test('title and description render above the grid, not overlapping the images', async ({
    page,
  }) => {
    await openGallery(page, 'Coastal Mornings');

    const heading = page.getByRole('heading', { level: 1 });
    const description = page.locator('main section p.text-lg');
    await expect(heading).toBeVisible();
    await expect(description).toHaveText(/first light along a cold shoreline/i);

    // The metadata block sits entirely above the thumbnail grid.
    const meta = await page.locator('main section').boundingBox();
    const grid = await page.locator('.gallery-grid').boundingBox();
    expect(meta).not.toBeNull();
    expect(grid).not.toBeNull();
    expect(meta!.y + meta!.height).toBeLessThanOrEqual(grid!.y);
  });

  test('optional fields render only when present in frontmatter', async ({ page }) => {
    // Present: coastal-mornings has a location and three tags.
    await openGallery(page, 'Coastal Mornings');
    const meta = page.locator('main section dl');
    await expect(meta).toContainText('Northumberland coast');
    await expect(meta.locator('li')).toHaveText(['landscape', 'coastal', 'dawn']);
    // Date always shows.
    await expect(meta.locator('time')).toHaveAttribute('datetime', '2026-02-14');

    // Absent: harbour-lights has neither — only the date line renders.
    await openGallery(page, 'Harbour Lights');
    const bare = page.locator('main section dl');
    await expect(bare.locator('time')).toHaveAttribute('datetime', '2026-05-30');
    await expect(bare.locator('li')).toHaveCount(0);
    await expect(bare).not.toContainText('Northumberland');
  });

  test('metadata stays visually subordinate to the photos', async ({ page }) => {
    await openGallery(page, 'Coastal Mornings');

    const size = (loc: import('@playwright/test').Locator) =>
      loc.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));

    const headingSize = await size(page.getByRole('heading', { level: 1 }));
    const metaSize = await size(page.locator('main section dl'));

    // The date/location/tags line is set small — well under the title.
    expect(metaSize).toBeLessThan(headingSize);
    expect(metaSize).toBeLessThanOrEqual(14);

    // It uses the muted secondary colour, not the primary ink used for the title.
    const headingColor = await page
      .getByRole('heading', { level: 1 })
      .evaluate((el) => getComputedStyle(el).color);
    const metaColor = await page
      .locator('main section dl')
      .evaluate((el) => getComputedStyle(el).color);
    expect(metaColor).not.toBe(headingColor);
  });
});
