import { test, expect } from '@playwright/test';
import { currentImage, fullSrcForThumb, openLightbox, openTestGallery } from './support';

// User story #14 — [3.4] Thumbnail strip.
// Acceptance criteria, mapped one-to-one to the tests below:
//   - Strip shows all photos in the current gallery; current photo indicated
//   - Clicking a strip thumbnail navigates the main view instantly
//   - Strip scrolls/follows as the current photo changes, keeping the active
//     thumbnail in view
//   - Hidden on narrow viewports where it would crowd the image (decision:
//     hidden below 640px, applied in GalleryGrid.astro)
//
// The fixture gallery ships 9 frames — more than fit a 640px-wide strip — so
// "follows / scrolls" is observable.

test.describe('thumbnail strip', () => {
  test('shows every photo in the gallery, with the current one marked', async ({ page }) => {
    await openTestGallery(page);
    const gridCount = await page.locator('.gallery-grid li a').count();

    await openLightbox(page, page.locator('.gallery-grid li a').nth(2));

    const items = page.locator('.pswp__thumbstrip .pswp__thumbstrip-item');
    await expect(items).toHaveCount(gridCount);

    // Exactly one item is the active one, and it is the photo we opened.
    const active = page.locator('.pswp__thumbstrip-item[aria-selected="true"]');
    await expect(active).toHaveCount(1);
    await expect(items.nth(2)).toHaveAttribute('aria-selected', 'true');
  });

  test('clicking a strip thumbnail navigates the main view', async ({ page }) => {
    await openTestGallery(page);
    await openLightbox(page, page.locator('.gallery-grid li a').first());

    await page.locator('.pswp__thumbstrip-item').nth(4).click();

    await expect(currentImage(page)).toHaveAttribute('src', await fullSrcForThumb(page, 4));
    await expect(page.locator('.pswp__thumbstrip-item').nth(4)).toHaveAttribute(
      'aria-selected',
      'true',
    );
    // The viewer stays open — a strip click must not fall through to close it.
    await expect(page.locator('.pswp')).toBeVisible();
  });

  test('the strip follows the current photo, keeping the active thumb in view', async ({
    page,
  }) => {
    // A viewport wide enough to show the strip (>= 640px) but narrow enough that
    // nine thumbnails overflow it, so "follows / scrolls" is observable.
    await page.setViewportSize({ width: 640, height: 800 });
    await openTestGallery(page);
    const count = await page.locator('.gallery-grid li a').count();

    await openLightbox(page, page.locator('.gallery-grid li a').first());

    const strip = page.locator('.pswp__thumbstrip');
    const scrollLeft = () => strip.evaluate((el) => el.scrollLeft);

    // Starts pinned to the left on the first photo.
    expect(await scrollLeft()).toBe(0);

    // Jump to the last photo — the strip scrolls to bring it into view.
    for (let i = 1; i < count; i++) await page.keyboard.press('ArrowRight');
    await expect(currentImage(page)).toHaveAttribute('src', await fullSrcForThumb(page, count - 1));

    const last = page.locator('.pswp__thumbstrip-item').nth(count - 1);
    await expect(last).toHaveAttribute('aria-selected', 'true');
    await expect(last).toBeInViewport();
    expect(await scrollLeft()).toBeGreaterThan(0);

    // Back to the first — the strip scrolls back.
    for (let i = 1; i < count; i++) await page.keyboard.press('ArrowLeft');
    const first = page.locator('.pswp__thumbstrip-item').first();
    await expect(first).toHaveAttribute('aria-selected', 'true');
    await expect(first).toBeInViewport();
    await expect.poll(scrollLeft).toBe(0);
  });

  test('is hidden on narrow viewports', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 720 });
    await openTestGallery(page);
    await openLightbox(page, page.locator('.gallery-grid li a').first());

    await expect(page.locator('.pswp__thumbstrip')).toBeHidden();
  });
});
