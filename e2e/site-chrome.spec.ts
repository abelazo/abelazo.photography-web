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
});
