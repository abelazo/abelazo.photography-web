import { test, expect, type Page, type Locator } from '@playwright/test';

// User story #27 — [5.5] Responsive/mobile behavior audit.
//   As a visitor on a mobile device, I want the entire site — not just the
//   lightbox — to behave correctly on small screens.
//
// Acceptance criteria, mapped one-to-one to the describe blocks below:
//   1. No horizontal scroll on any page at common mobile widths (320–414px).
//   2. Tap targets meet a minimum size (~44×44px).
//   3. Text stays legible without zoom; images don't overflow their containers.
//
// Tablet/desktop breakpoint + column-count assertions are a separate story
// (#35) — this spec stays inside the 320–414px mobile band.

const MOBILE_WIDTHS = [320, 375, 414];
const MIN_TAP = 44;

/** The static routes. The gallery detail route is reached by click instead —
 *  its slug is content-dependent (see `gotoFirstGallery`). */
const STATIC_PATHS = ['/', '/about', '/contact'];

const NAV_LINKS = ['Galleries', 'About', 'Contact'] as const;

async function gotoFirstGallery(page: Page): Promise<void> {
  await page.goto('/');
  await page.locator('main article').first().getByRole('link').click();
  await expect(page).toHaveURL(/\/galleries\/[a-z0-9-]+$/);
}

/** Walk the viewport down the page so any lazy-loaded content that could widen
 *  the layout has loaded before we measure. */
async function scrollThrough(page: Page): Promise<void> {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
}

/** Widest horizontal overflow on the page, in CSS px. `> 1` means a real
 *  sideways scroll (1px cushion absorbs sub-pixel rounding). Compared against
 *  `innerWidth`, not `clientWidth`, so the reserved scrollbar gutter
 *  (`scrollbar-gutter: stable` in global.css) is not counted as overflow. */
async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => {
    const w = window.innerWidth;
    return Math.max(document.documentElement.scrollWidth - w, document.body.scrollWidth - w);
  });
}

test.describe('responsive / mobile behaviour', () => {
  test.describe('AC1 — no horizontal scroll at 320–414px', () => {
    for (const width of MOBILE_WIDTHS) {
      test.describe(`at ${width}px`, () => {
        test.use({ viewport: { width, height: 800 } });

        test('static pages do not scroll sideways', async ({ page }) => {
          for (const path of STATIC_PATHS) {
            await page.goto(path);
            await scrollThrough(page);
            expect(await horizontalOverflow(page), `${path} @ ${width}px`).toBeLessThanOrEqual(1);
          }
        });

        test('the gallery detail page does not scroll sideways', async ({ page }) => {
          await gotoFirstGallery(page);
          await scrollThrough(page);
          expect(await horizontalOverflow(page), `gallery detail @ ${width}px`).toBeLessThanOrEqual(
            1,
          );
        });
      });
    }
  });

  test.describe('AC2 — tap targets are at least 44×44px', () => {
    test.use({ viewport: { width: 375, height: 800 } });

    async function expectHittable(locator: Locator, label: string): Promise<void> {
      await expect(locator, `${label} — visible`).toBeVisible();
      const box = await locator.boundingBox();
      expect(box, `${label} — has a box`).not.toBeNull();
      expect(box!.width, `${label} — width`).toBeGreaterThanOrEqual(MIN_TAP);
      expect(box!.height, `${label} — height`).toBeGreaterThanOrEqual(MIN_TAP);
    }

    test('the header wordmark and hamburger toggle', async ({ page }) => {
      await page.goto('/');
      const header = page.getByRole('banner');
      await expectHittable(header.getByRole('link', { name: 'Abelazo' }), 'wordmark');
      await expectHittable(header.getByRole('button', { name: 'Menu' }), 'hamburger toggle');
    });

    test('every link in the open mobile menu', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('banner').getByRole('button', { name: 'Menu' }).click();
      const nav = page.getByRole('navigation', { name: 'Primary' });
      for (const label of NAV_LINKS) {
        await expectHittable(
          nav.getByRole('link', { name: label, exact: true }),
          `nav link "${label}"`,
        );
      }
    });

    test('the home-page gallery card link', async ({ page }) => {
      await page.goto('/');
      await expectHittable(page.locator('main article').first().getByRole('link'), 'gallery card');
    });

    test('the back link and grid tiles on a gallery detail page', async ({ page }) => {
      await gotoFirstGallery(page);
      await expectHittable(
        page.getByRole('main').getByRole('link', { name: /Galleries/ }),
        'back link',
      );
      await expectHittable(page.locator('.gallery-grid li a').first(), 'first grid tile');
    });
  });

  test.describe('AC3 — legible text, contained images', () => {
    test('the viewport meta tag allows pinch-zoom', async ({ page }) => {
      await page.goto('/');
      const content = (await page.locator('meta[name="viewport"]').getAttribute('content')) ?? '';
      expect(content).toContain('width=device-width');
      expect(content).not.toMatch(/user-scalable\s*=\s*no/);
      expect(content).not.toMatch(/maximum-scale/);
    });

    for (const width of MOBILE_WIDTHS) {
      test.describe(`at ${width}px`, () => {
        test.use({ viewport: { width, height: 800 } });

        test('body copy renders at 16px or larger', async ({ page }) => {
          for (const path of STATIC_PATHS) {
            await page.goto(path);
            const size = await page
              .locator('main p')
              .first()
              .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
            expect(size, `${path} @ ${width}px`).toBeGreaterThanOrEqual(16);
          }
        });

        test('images never overflow their container', async ({ page }) => {
          await gotoFirstGallery(page);
          await scrollThrough(page);
          const spills = await page.locator('main img').evaluateAll(
            (imgs, w) =>
              imgs
                .map((img) => img.getBoundingClientRect())
                .filter((r) => r.width > 0)
                .map((r) => Math.round(Math.max(-r.left, r.right - w)))
                .filter((px) => px > 1),
            width,
          );
          expect(spills, `overflowing images @ ${width}px`).toEqual([]);
        });
      });
    }
  });
});
