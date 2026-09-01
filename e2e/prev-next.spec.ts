import { test, expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

// User story #12 — [3.2] Prev/next navigation.
// Acceptance criteria, mapped one-to-one to the tests below:
//   - Prev/next controls visible on hover/tap; arrow-key navigation on desktop
//   - Navigation wraps at the first/last image (decision: wrap, applied here and
//     documented in GalleryGrid.astro)
//   - Full-res image for the next/prev photo preloads before it's needed

/** Open the first gallery detail page from the homepage, script bound. */
async function openFirstGallery(page: Page) {
  await page.goto('/');
  await page.locator('main article').first().getByRole('link').click();
  await expect(page).toHaveURL(/\/galleries\/[a-z0-9-]+$/);
  await expect(page.locator('.gallery-grid')).toHaveAttribute('data-pswp-ready', '');
}

/** Click a thumbnail and wait for PhotoSwipe to finish its open animation
 *  (it ignores input until then). */
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

/** Absolute src the viewer will use for the thumbnail at `index`. */
async function fullSrcForThumb(page: Page, index: number) {
  const href = (await page.locator('.gallery-grid li a').nth(index).getAttribute('href')) as string;
  return new URL(href, page.url()).href;
}

test.describe('prev/next navigation', () => {
  test('arrow buttons are present and move between photos', async ({ page }) => {
    await openFirstGallery(page);
    await openLightbox(page, page.locator('.gallery-grid li a').first());

    const prev = page.locator('.pswp__button--arrow--prev');
    const next = page.locator('.pswp__button--arrow--next');
    await expect(prev).toBeVisible();
    await expect(next).toBeVisible();

    await next.click();
    await expect(currentImage(page)).toHaveAttribute('src', await fullSrcForThumb(page, 1));

    await next.click();
    await expect(currentImage(page)).toHaveAttribute('src', await fullSrcForThumb(page, 2));

    await prev.click();
    await expect(currentImage(page)).toHaveAttribute('src', await fullSrcForThumb(page, 1));
  });

  test('ArrowLeft / ArrowRight navigate on desktop', async ({ page }) => {
    await openFirstGallery(page);
    await openLightbox(page, page.locator('.gallery-grid li a').first());

    await page.keyboard.press('ArrowRight');
    await expect(currentImage(page)).toHaveAttribute('src', await fullSrcForThumb(page, 1));

    await page.keyboard.press('ArrowLeft');
    await expect(currentImage(page)).toHaveAttribute('src', await fullSrcForThumb(page, 0));
  });

  test('navigation wraps at the first and last photo', async ({ page }) => {
    await openFirstGallery(page);
    const thumbs = page.locator('.gallery-grid li a');
    const count = await thumbs.count();

    // Backwards off the first photo → last photo.
    await openLightbox(page, thumbs.first());
    await page.keyboard.press('ArrowLeft');
    await expect(currentImage(page)).toHaveAttribute('src', await fullSrcForThumb(page, count - 1));

    // Neither arrow is disabled while wrapping.
    await expect(page.locator('.pswp__button--arrow--prev')).not.toBeDisabled();
    await expect(page.locator('.pswp__button--arrow--next')).not.toBeDisabled();

    // Forwards off the last photo → first photo.
    await page.keyboard.press('ArrowRight');
    await expect(currentImage(page)).toHaveAttribute('src', await fullSrcForThumb(page, 0));
  });

  test('the next photo is preloaded at full resolution before it is shown', async ({ page }) => {
    await openFirstGallery(page);
    await openLightbox(page, page.locator('.gallery-grid li a').first());

    const nextSrc = await fullSrcForThumb(page, 1);

    // While slide 0 is still the active slide, PhotoSwipe should already have
    // fetched slide 1's full-res image (preload: [1, 2]). Assert it is in the
    // DOM, fully decoded, and is not the low-res placeholder.
    const preloaded = page.locator(`img.pswp__img:not(.pswp__img--placeholder)[src="${nextSrc}"]`);
    await expect(preloaded).toHaveJSProperty('complete', true);
    expect(await preloaded.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(
      0,
    );
  });
});
