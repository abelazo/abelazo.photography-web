import { test, expect } from '@playwright/test';
import { currentImage, currentZoomWrap, openLightbox, openTestGallery } from './support';

// User story #16 — [3.6] Zoom.
// Acceptance criteria, mapped one-to-one to the tests below:
//   - Click / double-click (desktop) and double-tap / pinch (mobile) toggle or
//     control zoom
//   - Zoomed image pans via drag / touch
//   - Zoom resets when navigating to the next / prev photo
//
// Zoom levels are pinned in GalleryGrid.astro (`initialZoomLevel: 'fit'`,
// `secondaryZoomLevel: 'fill'`), so every photo has real zoom headroom and the
// `.pswp--zoomed-in` / `.pswp--zoom-allowed` state on `.pswp` is meaningful.
// The fixture gallery's last frame (`09-frame.jpg`) is a 2560×1707 source —
// GalleryGrid caps the rendition at 2400px wide — so desktop zoom has genuine
// detail to pan around.

test.describe('zoom', () => {
  test('the zoom button is present and toggles zoom', async ({ page }) => {
    await openTestGallery(page);
    await openLightbox(page, page.locator('.gallery-grid li a').first());

    const pswp = page.locator('.pswp');
    const zoomButton = page.locator('.pswp__button--zoom');

    // The photo is zoomable and the control is offered.
    await expect(pswp).toHaveClass(/pswp--zoom-allowed/);
    await expect(zoomButton).toBeVisible();
    await expect(pswp).not.toHaveClass(/pswp--zoomed-in/);

    // Toggle in, then back out.
    await zoomButton.click();
    await expect(pswp).toHaveClass(/pswp--zoomed-in/);

    await zoomButton.click();
    await expect(pswp).not.toHaveClass(/pswp--zoomed-in/);
  });

  test('clicking and double-clicking the image toggle zoom (desktop)', async ({ page }) => {
    await openTestGallery(page);
    await openLightbox(page, page.locator('.gallery-grid li a').first());

    const pswp = page.locator('.pswp');
    const image = currentImage(page);

    // Double-click zooms in.
    await image.dblclick();
    await expect(pswp).toHaveClass(/pswp--zoomed-in/);

    // A single click on the zoomed image zooms back out.
    await image.click();
    await expect(pswp).not.toHaveClass(/pswp--zoomed-in/);
  });

  test('the zoomed image pans via drag', async ({ page }) => {
    await openTestGallery(page);
    await openLightbox(page, page.locator('.gallery-grid li a').first());

    const pswp = page.locator('.pswp');
    const zoomWrap = currentZoomWrap(page);

    const box = (await currentImage(page).boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    // Zoom in via double-click at the image centre.
    await page.mouse.dblclick(cx, cy);
    await expect(pswp).toHaveClass(/pswp--zoomed-in/);

    const transformBefore = await zoomWrap.evaluate((el) => el.style.transform);

    // Drag upwards — the fill zoom always leaves vertical pan room.
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx, cy - 160, { steps: 12 });
    await page.mouse.up();

    await expect
      .poll(() => zoomWrap.evaluate((el) => el.style.transform))
      .not.toBe(transformBefore);
  });

  test('zoom resets when navigating to the next / prev photo', async ({ page }) => {
    await openTestGallery(page);
    await openLightbox(page, page.locator('.gallery-grid li a').first());

    const pswp = page.locator('.pswp');

    // Zoom into the first photo.
    await currentImage(page).dblclick();
    await expect(pswp).toHaveClass(/pswp--zoomed-in/);

    // Next photo opens at fit, not zoomed.
    await page.locator('.pswp__button--arrow--next').click();
    await expect(pswp).not.toHaveClass(/pswp--zoomed-in/);

    // Zoom this one too, then go back — still reset.
    await currentImage(page).dblclick();
    await expect(pswp).toHaveClass(/pswp--zoomed-in/);

    await page.locator('.pswp__button--arrow--prev').click();
    await expect(pswp).not.toHaveClass(/pswp--zoomed-in/);
  });

  test('the high-resolution fixture gives desktop zoom real detail and pan headroom', async ({
    page,
  }) => {
    await openTestGallery(page);

    // The last frame (`09-frame.jpg`) is a 2560×1707 source — added specifically
    // so desktop zoom has something to zoom into.
    const thumb = page.locator('.gallery-grid li a').last();
    await openLightbox(page, thumb);

    const pswp = page.locator('.pswp');
    const image = currentImage(page);
    const zoomWrap = currentZoomWrap(page);

    // The full rendition is high-res (GalleryGrid caps at 2400px wide) — wait for
    // it to finish decoding before reading its intrinsic size.
    await expect(image).toHaveJSProperty('complete', true);
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThanOrEqual(2000);

    const box = (await image.boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    await page.mouse.dblclick(cx, cy);
    await expect(pswp).toHaveClass(/pswp--zoomed-in/);

    const before = await zoomWrap.evaluate((el) => el.style.transform);
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx, cy - 180, { steps: 12 });
    await page.mouse.up();

    await expect.poll(() => zoomWrap.evaluate((el) => el.style.transform)).not.toBe(before);
  });
});

test.describe('zoom (mobile)', () => {
  // `isMobile` device emulation is a Chromium/WebKit feature — Playwright's
  // Firefox rejects the context option outright, so skip this engine here.
  test.skip(
    ({ browserName }) => browserName === 'firefox',
    'isMobile emulation is not supported in Firefox',
  );
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test('double-tap toggles zoom', async ({ page }) => {
    await openTestGallery(page);
    await openLightbox(page, page.locator('.gallery-grid li a').first());

    const pswp = page.locator('.pswp');

    const box = (await currentImage(page).boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    // Double-tap zooms in.
    await page.touchscreen.tap(cx, cy);
    await page.touchscreen.tap(cx, cy);
    await expect(pswp).toHaveClass(/pswp--zoomed-in/);

    // Double-tap again zooms back out.
    await page.touchscreen.tap(cx, cy);
    await page.touchscreen.tap(cx, cy);
    await expect(pswp).not.toHaveClass(/pswp--zoomed-in/);
  });
});
