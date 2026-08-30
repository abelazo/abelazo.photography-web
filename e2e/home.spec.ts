import { test, expect } from '@playwright/test';

test.describe('home page', () => {
  test('loads with a title and heading', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.ok()).toBe(true);
    await expect(page).toHaveTitle(/Abelazo Photography/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Abelazo Photography');
  });

  test('lists the galleries', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('main article');
    await expect(cards.first()).toBeVisible();
    // Sample content ships two galleries; there is always at least one.
    expect(await cards.count()).toBeGreaterThanOrEqual(1);
    // Every card has a heading and a cover image.
    for (const card of await cards.all()) {
      await expect(card.getByRole('heading', { level: 2 })).toBeVisible();
      await expect(card.locator('img')).toBeVisible();
    }
  });
});
