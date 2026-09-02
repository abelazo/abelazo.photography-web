import { test, expect, type Page } from '@playwright/test';

// User story #23 — Lazy loading.
//   As a visitor on any connection speed, I want offscreen images to load only
//   as I scroll to them, so that pages load fast even on galleries with many
//   photos.
//
// Acceptance criteria, one `test()` each:
//   1. Grid thumbnails below the fold use native lazy loading.
//   2. Above-the-fold / hero images load eagerly (not lazy).
//   3. No layout shift when lazy images load in.

/** Cumulative Layout Shift accrued on the page since load, ignoring shifts that
 *  follow user input. Installed before any navigation, read after scrolling the
 *  whole page so every lazy image has had its chance to shift the layout. */
async function startCls(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & {
        value: number;
        hadRecentInput: boolean;
      })[]) {
        if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
}

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
}

async function readCls(page: Page): Promise<number> {
  return page.evaluate(() => (window as unknown as { __cls: number }).__cls);
}

async function openFirstGallery(page: Page) {
  await page.goto('/');
  await page.locator('main article').first().getByRole('link').click();
  await expect(page).toHaveURL(/\/galleries\/[a-z0-9-]+$/);
  await expect(page.locator('.gallery-grid li a').first()).toBeVisible();
}

test.describe('lazy loading (#23)', () => {
  test('grid thumbnails below the fold use native lazy loading', async ({ page }) => {
    await openFirstGallery(page);

    const images = page.locator('.gallery-grid li img');
    const count = await images.count();
    expect(count).toBeGreaterThan(3);

    // The tail of the grid is offscreen on load — those thumbnails defer to the
    // browser's native lazy loading.
    await expect(images.last()).toHaveAttribute('loading', 'lazy');

    // Every thumbnail carries an explicit loading hint (no implicit default).
    for (const img of await images.all()) {
      await expect(img).toHaveAttribute('loading', /^(eager|lazy)$/);
    }
  });

  test('above-the-fold images load eagerly, not lazy', async ({ page }) => {
    // Home page: the first card cover is the largest paint above the fold.
    await page.goto('/');
    await expect(page.locator('main article img').first()).toHaveAttribute('loading', 'eager');

    // Gallery detail page: the first grid row leads the page and loads eagerly.
    await openFirstGallery(page);
    await expect(page.locator('.gallery-grid li img').first()).toHaveAttribute('loading', 'eager');
  });

  test('no layout shift as lazy images load in — home page', async ({ page }) => {
    await startCls(page);
    await page.goto('/');
    await expect(page.locator('main article img').first()).toBeVisible();

    // Every cover reserves its box via intrinsic width/height before it loads.
    for (const img of await page.locator('main article img').all()) {
      await expect(img).toHaveAttribute('width', /^\d+$/);
      await expect(img).toHaveAttribute('height', /^\d+$/);
    }

    await scrollThrough(page);
    expect(await readCls(page)).toBeLessThan(0.1);
  });

  test('no layout shift as lazy images load in — gallery detail page', async ({ page }) => {
    await startCls(page);
    await openFirstGallery(page);
    await expect(page.locator('.gallery-grid li a').first()).toBeVisible();

    // Each tile reserves space via an aspect-ratio box before its image loads.
    for (const link of await page.locator('.gallery-grid li a').all()) {
      await expect(link).toHaveAttribute('style', /aspect-ratio/);
    }

    await scrollThrough(page);
    expect(await readCls(page)).toBeLessThan(0.1);
  });
});
