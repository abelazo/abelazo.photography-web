import { test, expect } from '@playwright/test';

test.describe('site chrome', () => {
  test('header exposes the wordmark and primary nav', async ({ page }) => {
    await page.goto('/');
    const header = page.getByRole('banner');
    await expect(header.getByRole('link', { name: 'Abelazo' })).toBeVisible();
    await expect(
      header.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Galleries' }),
    ).toBeVisible();
  });

  test('footer shows the attribution', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('contentinfo')).toContainText('Abel Guillen');
  });

  test('the page sits on a light background', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const rgb = await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor);
    const [r, g, b] = rgb.match(/\d+/g)!.map(Number);
    // Light-only: even with the OS in dark mode the wall stays near-white.
    expect((r + g + b) / 3).toBeGreaterThan(230);
  });
});
