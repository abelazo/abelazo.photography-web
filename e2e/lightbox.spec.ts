import { test, expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

// User story #11 — [3.1] Open/close lightbox.
// Acceptance criteria, mapped one-to-one to the tests below.

/** Open the first gallery detail page from the homepage. */
async function openFirstGallery(page: Page) {
  await page.goto('/');
  await page.locator('main article').first().getByRole('link').click();
  await expect(page).toHaveURL(/\/galleries\/[a-z0-9-]+$/);
  // Wait for the lightbox script to bind before interacting — until then the
  // anchors just navigate to the image.
  await expect(page.locator('.gallery-grid')).toHaveAttribute('data-pswp-ready', '');
}

/** Click a thumbnail and wait for PhotoSwipe to finish its open animation
 *  (it ignores close input until then). */
async function openLightbox(page: Page, thumb: Locator) {
  await thumb.click();
  await expect(page.locator('.pswp')).toHaveClass(/pswp--ui-visible/);
  await expect(page.locator('.pswp__img:not(.pswp__img--placeholder)').first()).toBeVisible();
}

/** The image shown on the currently-active slide. */
function currentImage(page: Page) {
  return page.locator(
    '.pswp__item:not([aria-hidden="true"]) img.pswp__img:not(.pswp__img--placeholder)',
  );
}

test.describe('fullscreen lightbox', () => {
  test('clicking a thumbnail opens PhotoSwipe at that image', async ({ page }) => {
    await openFirstGallery(page);

    const secondThumb = page.locator('.gallery-grid li a').nth(1);
    const expectedSrc = new URL((await secondThumb.getAttribute('href')) as string, page.url())
      .href;
    await openLightbox(page, secondThumb);

    await expect(currentImage(page)).toHaveAttribute('src', expectedSrc);
  });

  test('closes via the close button, Esc, and clicking outside the image', async ({ page }) => {
    await openFirstGallery(page);
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
    await openFirstGallery(page);

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
    await openFirstGallery(page);
    const thumb = page.locator('.gallery-grid li a').nth(2);

    await openLightbox(page, thumb);
    await page.keyboard.press('Escape');
    await expect(page.locator('.pswp')).toBeHidden();

    await expect(thumb).toBeFocused();
  });
});
