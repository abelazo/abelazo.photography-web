import { test, expect } from '@playwright/test';

// User story #9 — [2.3] Site navigation.
// Acceptance criteria, mapped one-to-one to the tests below.

const NAV_LINKS = ['Galleries', 'About', 'Contact'];

/** A gallery detail URL, to prove the nav rides along on nested routes too. */
async function firstGalleryHref(page: import('@playwright/test').Page): Promise<string> {
  await page.goto('/');
  const href = await page.locator('main article a').first().getAttribute('href');
  if (!href) throw new Error('no gallery card found');
  return href;
}

test.describe('site navigation', () => {
  test('nav present on every page with the primary links', async ({ page }) => {
    const galleryHref = await firstGalleryHref(page);

    for (const path of ['/', '/about', '/contact', galleryHref]) {
      await page.goto(path);
      const nav = page.getByRole('banner').getByRole('navigation', { name: 'Primary' });
      for (const label of NAV_LINKS) {
        await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible();
      }
    }
  });

  test('current section is marked active', async ({ page }) => {
    const galleryHref = await firstGalleryHref(page);

    const cases: [string, string][] = [
      ['/', 'Galleries'],
      ['/about', 'About'],
      ['/contact', 'Contact'],
      [galleryHref, 'Galleries'], // detail pages stay under the Galleries section
    ];

    for (const [path, active] of cases) {
      await page.goto(path);
      const nav = page.getByRole('banner').getByRole('navigation', { name: 'Primary' });
      await expect(nav.getByRole('link', { name: active, exact: true })).toHaveAttribute(
        'aria-current',
        'page',
      );
      // Exactly one link is current.
      await expect(nav.locator('a[aria-current="page"]')).toHaveCount(1);
    }
  });

  test.describe('mobile', () => {
    test.use({ viewport: { width: 375, height: 720 } });

    test('collapses behind a hamburger toggle', async ({ page }) => {
      await page.goto('/');

      const toggle = page.getByRole('banner').getByRole('button', { name: 'Menu' });
      const galleriesLink = page
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('link', { name: 'Galleries', exact: true });

      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(galleriesLink).toBeHidden();

      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(galleriesLink).toBeVisible();

      // Escape closes it and returns focus to the toggle.
      await page.keyboard.press('Escape');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(galleriesLink).toBeHidden();
      await expect(toggle).toBeFocused();
    });

    test('a link in the open menu navigates', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('banner').getByRole('button', { name: 'Menu' }).click();
      await page
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('link', { name: 'About', exact: true })
        .click();
      await expect(page).toHaveURL(/\/about$/);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('About');
    });
  });

  test('is keyboard navigable with visible focus', async ({ page }) => {
    await page.goto('/');

    // Tab order: the wordmark link comes before the nav links.
    await page.keyboard.press('Tab');
    await expect(page.getByRole('banner').getByRole('link', { name: 'Abelazo' })).toBeFocused();

    await page.keyboard.press('Tab');
    const galleries = page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'Galleries', exact: true });
    await expect(galleries).toBeFocused();

    // A focus ring is actually painted (outline set by :focus-visible).
    const outlineWidth = await galleries.evaluate((el) => getComputedStyle(el).outlineWidth);
    expect(parseFloat(outlineWidth)).toBeGreaterThan(0);

    // The rest of the links are reachable in order.
    await page.keyboard.press('Tab');
    await expect(
      page
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('link', { name: 'About', exact: true }),
    ).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(
      page
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('link', { name: 'Contact', exact: true }),
    ).toBeFocused();
  });
});
