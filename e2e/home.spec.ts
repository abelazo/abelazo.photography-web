import { test, expect } from '@playwright/test';

// The home page (`StudioLanding`): a short hero — the studio's motto as the
// <h1> — then a taster grid of the galleries under the "Galerías" heading.

test.describe('home page', () => {
  test('loads with a title and the studio motto as the heading', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.ok()).toBe(true);
    await expect(page).toHaveTitle(/Abelazo Photography/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Todo el mundo se merece tener fotografías profesionales',
    );
  });

  test('lists the galleries as cards', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('#galleries ul > li');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThanOrEqual(1);

    // Every card has a heading, a cover image, and links to a detail page.
    for (const card of await cards.all()) {
      await expect(card.getByRole('heading', { level: 3 })).toBeVisible();
      await expect(card.locator('img')).toBeVisible();
      await expect(card.getByRole('link')).toHaveAttribute('href', /^\/galleries\/[a-z0-9-]+$/);
    }
  });

  test('a gallery card opens its detail page', async ({ page }) => {
    await page.goto('/');
    const firstCard = page.locator('#galleries ul > li').first();
    const title = (await firstCard.getByRole('heading', { level: 3 }).textContent())!.trim();
    await firstCard.getByRole('link').click();
    await expect(page).toHaveURL(/\/galleries\/[a-z0-9-]+$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
  });
});
