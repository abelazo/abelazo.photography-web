import { test, expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

// User story #14 — [3.4] Thumbnail strip.
// Acceptance criteria, mapped one-to-one to the tests below:
//   - Strip shows all photos in the current gallery; current photo indicated
//   - Clicking a strip thumbnail navigates the main view instantly
//   - Strip scrolls/follows as the current photo changes, keeping the active
//     thumbnail in view
//   - Hidden on narrow viewports where it would crowd the image (decision:
//     hidden below 640px, applied in GalleryGrid.astro)

/** Open the first gallery detail page from the homepage, script bound. */
async function openFirstGallery(page: Page) {
  await page.goto('/');
  await page.locator('main article').first().getByRole('link').click();
  await expect(page).toHaveURL(/\/galleries\/[a-z0-9-]+$/);
  await expect(page.locator('.gallery-grid')).toHaveAttribute('data-pswp-ready', '');
}

/** Click a thumbnail and wait for PhotoSwipe to finish its open animation. */
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

test.describe('thumbnail strip', () => {
  test('shows every photo in the gallery, with the current one marked', async ({ page }) => {
    await openFirstGallery(page);
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
    await openFirstGallery(page);
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
    // eight thumbnails overflow it, so "follows / scrolls" is observable.
    await page.setViewportSize({ width: 640, height: 800 });
    await openFirstGallery(page);
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
    await openFirstGallery(page);
    await openLightbox(page, page.locator('.gallery-grid li a').first());

    await expect(page.locator('.pswp__thumbstrip')).toBeHidden();
  });
});
