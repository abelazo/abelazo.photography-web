import { test, expect } from '@playwright/test';

// Internationalisation — the site is bilingual: Spanish is the default and
// unprefixed (`/`, `/the-session`, `/contact`, `/galleries`), English lives
// under `/en/`. URL path segments are English in BOTH locales — only the
// visitor-facing copy is translated.
//
// The suite pins the browser locale to es-ES (playwright.config.ts), so the
// default pages render Spanish with no redirect. Tests that need English set
// the `lang` cookie the switcher would set.

test.describe('internationalisation', () => {
  test('the default locale is Spanish, unprefixed', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Todo el mundo se merece tener fotografías profesionales',
    );
    const nav = page.getByRole('banner').getByRole('navigation', { name: 'Principal' });
    await expect(nav.getByRole('link', { name: 'La sesión', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Galerías', exact: true })).toBeVisible();
  });

  test('English lives under /en/ with the same path segments', async ({ page, context }) => {
    // The suite's browser locale is es-ES, so without a stored preference the
    // inline script in BaseLayout would bounce /en/ back to the default. Set
    // the cookie the switcher sets, then land on the English mirror directly.
    await context.addCookies([{ name: 'lang', value: 'en', url: 'http://localhost:4321' }]);
    await page.goto('/en/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Everyone deserves professional photographs',
    );

    // The nav is localised…
    const nav = page.getByRole('banner').getByRole('navigation', { name: 'Primary' });
    const session = nav.getByRole('link', { name: 'The session', exact: true });
    await expect(session).toBeVisible();
    // …but the URL segment is still English-the-path, prefixed with /en.
    await expect(session).toHaveAttribute('href', '/en/the-session');

    await session.click();
    await expect(page).toHaveURL(/\/en\/the-session\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The session');
  });

  test('URL segments are English on the Spanish pages too', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('banner').getByRole('navigation', { name: 'Principal' });
    await expect(nav.getByRole('link', { name: 'La sesión', exact: true })).toHaveAttribute(
      'href',
      '/the-session',
    );
    await expect(nav.getByRole('link', { name: 'Galerías', exact: true })).toHaveAttribute(
      'href',
      '/galleries',
    );

    await page.goto('/the-session');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('La sesión');
  });

  test('the language switcher jumps to the same page in the other locale', async ({ page }) => {
    await page.goto('/the-session');

    const toEnglish = page.getByRole('banner').getByRole('link', { name: 'English' });
    await expect(toEnglish).toHaveAttribute('href', /^\/en\/the-session\/?$/);
    await toEnglish.click();

    await expect(page).toHaveURL(/\/en\/the-session\/?$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The session');
  });

  test('a stored language preference is applied on the next visit', async ({ page, context }) => {
    await context.addCookies([{ name: 'lang', value: 'en', url: 'http://localhost:4321' }]);

    // Landing on the unprefixed home page with an English preference redirects
    // to the /en/ mirror (BaseLayout's inline script).
    await page.goto('/');
    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Everyone deserves professional photographs',
    );
  });

  test('every page carries hreflang alternates for both locales', async ({ page }) => {
    await page.goto('/the-session');
    await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveAttribute(
      'href',
      'https://abelazo.photography/the-session',
    );
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
      'href',
      'https://abelazo.photography/en/the-session',
    );
  });
});
