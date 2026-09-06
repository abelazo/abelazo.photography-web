import { test, expect } from '@playwright/test';
import { currentImage, openLightbox, openTestGallery } from './support';

// User story #11 — [3.1] Open/close lightbox.
// Acceptance criteria, mapped one-to-one to the tests below.

test.describe('fullscreen lightbox', () => {
  test('clicking a thumbnail opens PhotoSwipe at that image', async ({ page }) => {
    await openTestGallery(page);

    const secondThumb = page.locator('.gallery-grid li a').nth(1);
    const expectedSrc = new URL((await secondThumb.getAttribute('href')) as string, page.url())
      .href;
    await openLightbox(page, secondThumb);

    await expect(currentImage(page)).toHaveAttribute('src', expectedSrc);
  });

  test('closes via the close button, Esc, and clicking outside the image', async ({ page }) => {
    await openTestGallery(page);
    const thumb = page.locator('.gallery-grid li a').first();
    const pswp = page.locator('.pswp');

    // Close button.
    await openLightbox(page, thumb);
    await page.locator('.pswp__button--close').click();
    await expect(pswp).toBeHidden();

    // Esc key.
    await openLightbox(page, thumb);
    await page.keyboard.press('Escape');
    await expect(pswp).toBeHidden();

    // Click/tap outside the image (top-left corner, clear of image + controls).
    await openLightbox(page, thumb);
    await pswp.click({ position: { x: 10, y: 200 } });
    await expect(pswp).toBeHidden();
  });

  test('locks background page scroll while open', async ({ page }) => {
    await openTestGallery(page);

    const rootOverflow = () =>
      page.evaluate(() => getComputedStyle(document.documentElement).overflow);

    expect(await rootOverflow()).not.toBe('hidden');

    await openLightbox(page, page.locator('.gallery-grid li a').first());
    expect(await rootOverflow()).toBe('hidden');

    await page.keyboard.press('Escape');
    await expect(page.locator('.pswp')).toBeHidden();
    expect(await rootOverflow()).not.toBe('hidden');
  });

  test('closing returns focus to the thumbnail that opened it', async ({ page }) => {
    await openTestGallery(page);
    const thumb = page.locator('.gallery-grid li a').nth(2);

    await openLightbox(page, thumb);
    await page.keyboard.press('Escape');
    await expect(page.locator('.pswp')).toBeHidden();

    await expect(thumb).toBeFocused();
  });
});
