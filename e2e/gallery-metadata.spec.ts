import { test, expect } from '@playwright/test';
import {
  BARE_GALLERY_PATH,
  BARE_GALLERY_TITLE,
  TEST_GALLERY_PATH,
  TEST_GALLERY_TITLE,
} from './support';

// User story #10 — [2.4] Gallery detail page metadata.
// Acceptance criteria, mapped one-to-one to the tests below.
//
// Fixtures: `test-gallery` carries location + tags; `test-gallery-bare` carries
// neither — so both the "present" and "absent" paths are covered.

test.describe('gallery detail page metadata', () => {
  test('title and description render above the grid, not overlapping the images', async ({
    page,
  }) => {
    await page.goto(TEST_GALLERY_PATH);

    const heading = page.getByRole('heading', { level: 1 });
    const description = page.locator('main section p.text-lg');
    await expect(heading).toHaveText(TEST_GALLERY_TITLE);
    await expect(description).toHaveText(/suite de tests E2E/i);

    // The metadata block sits entirely above the thumbnail grid.
    const meta = await page.locator('main section').boundingBox();
    const grid = await page.locator('.gallery-grid').boundingBox();
    expect(meta).not.toBeNull();
    expect(grid).not.toBeNull();
    expect(meta!.y + meta!.height).toBeLessThanOrEqual(grid!.y);
  });

  test('optional fields render only when present in frontmatter', async ({ page }) => {
    // Present: test-gallery has a location and three tags.
    await page.goto(TEST_GALLERY_PATH);
    const meta = page.locator('main section dl');
    await expect(meta).toContainText('Estudio, Tres Cantos');
    await expect(meta.locator('li')).toHaveText(['prueba', 'e2e', 'fixture']);
    // Date always shows.
    await expect(meta.locator('time')).toHaveAttribute('datetime', '2020-06-15');

    // Absent: test-gallery-bare has neither — only the date line renders.
    await page.goto(BARE_GALLERY_PATH);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(BARE_GALLERY_TITLE);
    const bare = page.locator('main section dl');
    await expect(bare.locator('time')).toHaveAttribute('datetime', '2019-03-04');
    await expect(bare.locator('li')).toHaveCount(0);
    await expect(bare).not.toContainText('Estudio, Tres Cantos');
  });

  test('metadata stays visually subordinate to the photos', async ({ page }) => {
    await page.goto(TEST_GALLERY_PATH);

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
