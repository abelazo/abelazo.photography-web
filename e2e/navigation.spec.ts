import { test, expect } from '@playwright/test';

// User story #9 — [2.3] Site navigation.
// The visitor-facing nav labels are localised; this spec runs on the default
// (Spanish) pages. The cross-locale behaviour is in i18n.spec.ts.

// The primary nav labels, in order (Spanish — the default locale).
const NAV_LABELS = ['La sesión', 'Galerías', 'Contacto'] as const;

test.describe('site navigation', () => {
  test('nav present on every page with the primary links', async ({ page }) => {
    for (const path of ['/', '/the-session', '/contact', '/galleries/test-gallery']) {
      await page.goto(path);
      const nav = page.getByRole('banner').getByRole('navigation', { name: 'Principal' });
      for (const label of NAV_LABELS) {
        await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible();
      }
    }
  });

  test('current section is marked active', async ({ page }) => {
    const cases: [string, string][] = [
      ['/the-session', 'La sesión'],
      ['/contact', 'Contacto'],
      ['/galleries', 'Galerías'],
      ['/galleries/test-gallery', 'Galerías'], // detail pages stay under the Galerías section
    ];

    for (const [path, active] of cases) {
      await page.goto(path);
      const nav = page.getByRole('banner').getByRole('navigation', { name: 'Principal' });
      await expect(nav.getByRole('link', { name: active, exact: true })).toHaveAttribute(
        'aria-current',
        'page',
      );
      // Exactly one link is current.
      await expect(nav.locator('a[aria-current="page"]')).toHaveCount(1);
    }
  });

  test('the home page marks no primary link active', async ({ page }) => {
    // Home is not one of the three nav sections — nothing is aria-current there.
    await page.goto('/');
    const nav = page.getByRole('banner').getByRole('navigation', { name: 'Principal' });
    await expect(nav.locator('a[aria-current="page"]')).toHaveCount(0);
  });

  test.describe('mobile', () => {
    test.use({ viewport: { width: 375, height: 720 } });

    test('collapses behind a hamburger toggle', async ({ page }) => {
      await page.goto('/');

      const toggle = page.getByRole('banner').getByRole('button', { name: 'Menú' });
      const galleriesLink = page
        .getByRole('navigation', { name: 'Principal' })
        .getByRole('link', { name: 'Galerías', exact: true });

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
      await page.getByRole('banner').getByRole('button', { name: 'Menú' }).click();
      await page
        .getByRole('navigation', { name: 'Principal' })
        .getByRole('link', { name: 'La sesión', exact: true })
        .click();
      await expect(page).toHaveURL(/\/the-session$/);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('La sesión');
    });
  });

  test('is keyboard navigable with visible focus', async ({ page, browserName }) => {
    // macOS Playwright WebKit follows the system "Full Keyboard Access" setting —
    // Tab does not move focus to links, and Playwright cannot toggle it. The
    // Linux WebKit build used in CI behaves like Chromium, so this stays covered
    // there; only the local macOS run skips it.
    test.skip(
      browserName === 'webkit' && process.platform === 'darwin',
      'macOS WebKit does not move Tab focus to links',
    );
    await page.goto('/');

    // Tab order: the skip link is first, then the wordmark, then the nav links.
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Abelazo Photography' }),
    ).toBeFocused();

    await page.keyboard.press('Tab');
    const session = page
      .getByRole('navigation', { name: 'Principal' })
      .getByRole('link', { name: 'La sesión', exact: true });
    await expect(session).toBeFocused();

    // A focus ring is actually painted (outline set by :focus-visible).
    const outlineWidth = await session.evaluate((el) => getComputedStyle(el).outlineWidth);
    expect(parseFloat(outlineWidth)).toBeGreaterThan(0);

    // The rest of the links are reachable in order.
    await page.keyboard.press('Tab');
    await expect(
      page
        .getByRole('navigation', { name: 'Principal' })
        .getByRole('link', { name: 'Galerías', exact: true }),
    ).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(
      page
        .getByRole('navigation', { name: 'Principal' })
        .getByRole('link', { name: 'Contacto', exact: true }),
    ).toBeFocused();
  });
});
