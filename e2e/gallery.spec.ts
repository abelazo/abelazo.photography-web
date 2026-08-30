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
});
