import { test, expect } from '@playwright/test';

test.describe('gallery detail page', () => {
  test('renders a thumbnail grid with one linked, described image per photo', async ({ page }) => {
    await page.goto('/');
    const firstCard = page.locator('main article').first();
    const photoCount = Number(
      (await firstCard.locator('p', { hasText: /photos/ }).textContent())?.match(/\d+/)?.[0],
    );
    expect(photoCount).toBeGreaterThan(0);

    await firstCard.getByRole('link').click();
    await expect(page).toHaveURL(/\/galleries\/[a-z0-9-]+$/);

    const thumbs = page.locator('.gallery-grid li');
    await expect(thumbs).toHaveCount(photoCount);

    for (const thumb of await thumbs.all()) {
      const link = thumb.getByRole('link');
      await expect(link).toHaveAttribute('href', /\S/);
      await expect(link).toHaveAttribute('data-pswp-width', /^\d+$/);
      await expect(link).toHaveAttribute('data-pswp-height', /^\d+$/);
      const alt = await thumb.locator('img').getAttribute('alt');
      expect(alt?.trim()).toBeTruthy();
    }
  });

  test('thumbnails reserve aspect-ratio space and lazy-load below the fold', async ({ page }) => {
    await page.goto('/');
    await page.locator('main article').first().getByRole('link').click();

    const links = page.locator('.gallery-grid li a');
    await expect(links.first()).toHaveAttribute('style', /aspect-ratio/);

    const images = page.locator('.gallery-grid li img');
    await expect(images.first()).toHaveAttribute('loading', 'eager');
    await expect(images.last()).toHaveAttribute('loading', 'lazy');
  });

  test('the grid leads the page — no cover hero above it', async ({ page }) => {
    await page.goto('/');
    await page.locator('main article').first().getByRole('link').click();
    await expect(page.locator('.gallery-grid li a').first()).toBeVisible();

    // Every image on the detail page belongs to the thumbnail grid; there is no
    // separate hero image between the metadata and the grid.
    const all = await page.locator('main img').count();
    const inGrid = await page.locator('.gallery-grid img').count();
    expect(all).toBe(inGrid);
    expect(inGrid).toBeGreaterThan(0);
  });

  test('portrait and landscape frames sit together, uncropped', async ({ page }) => {
    await page.goto('/');
    await page.locator('main article').first().getByRole('link').click();

    const tiles = page.locator('.gallery-grid li a');
    await expect(tiles.first()).toBeVisible();
    const ratios: number[] = [];
    for (const tile of await tiles.all()) {
      const box = await tile.boundingBox();
      expect(box).not.toBeNull();
      const declared = await tile.evaluate((el) => {
        const [w, h] = getComputedStyle(el).aspectRatio.split('/').map(parseFloat);
        return w / h;
      });
      // The tile renders at its photo's own aspect ratio — no crop, no squash.
      expect(box!.width / box!.height).toBeCloseTo(declared, 1);
      ratios.push(declared);
    }

    expect(Math.min(...ratios)).toBeLessThan(0.9); // at least one portrait frame
    expect(Math.max(...ratios)).toBeGreaterThan(1.1); // at least one landscape frame
  });
});
