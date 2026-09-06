import { test, expect } from '@playwright/test';
import { currentImage, fullSrcForThumb, openLightbox, openTestGallery } from './support';

// User story #12 — [3.2] Prev/next navigation.
// Acceptance criteria, mapped one-to-one to the tests below:
//   - Prev/next controls visible on hover/tap; arrow-key navigation on desktop
//   - Navigation wraps at the first/last image (decision: wrap, applied here and
//     documented in GalleryGrid.astro)
//   - Full-res image for the next/prev photo preloads before it's needed

test.describe('prev/next navigation', () => {
  test('arrow buttons are present and move between photos', async ({ page }) => {
    await openTestGallery(page);
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
    await openTestGallery(page);
    await openLightbox(page, page.locator('.gallery-grid li a').first());

    await page.keyboard.press('ArrowRight');
    await expect(currentImage(page)).toHaveAttribute('src', await fullSrcForThumb(page, 1));

    await page.keyboard.press('ArrowLeft');
    await expect(currentImage(page)).toHaveAttribute('src', await fullSrcForThumb(page, 0));
  });

  test('navigation wraps at the first and last photo', async ({ page }) => {
    await openTestGallery(page);
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
    await openTestGallery(page);
    await openLightbox(page, page.locator('.gallery-grid li a').first());

    const nextSrc = await fullSrcForThumb(page, 1);

    // While slide 0 is still the active slide, PhotoSwipe should already have
    // fetched slide 1's full-res image (preload: [1, 2]). Assert it is in the
    // DOM, fully decoded, and is not the low-res placeholder.
    const preloaded = page.locator(`img.pswp__img:not(.pswp__img--placeholder)[src="${nextSrc}"]`);
    // Generous timeout: the dev server generates every derivative on first
    // request (AVIF + WebP + fallback, several widths per photo), so a cold
    // gallery page can take a few seconds to serve the preload image. The
    // point of the assertion is that the fetch happens before the visitor
    // navigates — which it does — not that it is instant.
    await expect(preloaded).toHaveJSProperty('complete', true, { timeout: 15_000 });
    expect(await preloaded.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(
      0,
    );
  });
});
