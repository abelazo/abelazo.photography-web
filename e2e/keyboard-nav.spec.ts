import { test, expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

// User story #17 — [3.7] Keyboard navigation.
// Acceptance criteria, mapped one-to-one to the tests below:
//   - Arrow keys: prev/next; Esc: close; Tab cycles the visible controls in a
//     logical order
//   - Focus is trapped within the lightbox while open (never leaks to the page
//     behind it)
//   - Every interactive control has a visible focus indicator and an
//     accessible label (aria-label)
//
// PhotoSwipe supplies the raw pieces (ArrowLeft/ArrowRight, Escape, labelled
// buttons), but its focus trap never wraps Tab and a pointer open leaves focus
// on the page. GalleryGrid.astro closes those gaps: `inert` on the rest of the
// page, a Tab-wrapping handler, a focus hand-back on close, and a light
// `:focus-visible` ring that stays visible over PhotoSwipe's dark chrome.
// Arrow-key and Esc behaviour is also covered from the navigation/open-close
// angle in prev-next.spec.ts and lightbox.spec.ts — here they are re-asserted
// purely as keyboard affordances.

/** Open the first gallery detail page from the homepage, script bound. */
async function openFirstGallery(page: Page) {
  await page.goto('/');
  await page.locator('main article').first().getByRole('link').click();
  await expect(page).toHaveURL(/\/galleries\/[a-z0-9-]+$/);
  await expect(page.locator('.gallery-grid')).toHaveAttribute('data-pswp-ready', '');
}

/** Click a thumbnail and wait for PhotoSwipe to finish its open animation
 *  (it ignores input until then). */
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

/** Where focus currently sits inside the viewer: a compact, stable descriptor. */
function activeDescriptor(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return null;
    return {
      insidePswp: !!el.closest('.pswp'),
      tag: el.tagName.toLowerCase(),
      cls: el.className,
      label: el.getAttribute('aria-label'),
      hasVisibleOutline: (() => {
        const s = getComputedStyle(el);
        return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0;
      })(),
    };
  });
}

test.describe('keyboard navigation', () => {
  test('Arrow keys move between photos, Esc closes', async ({ page }) => {
    await openFirstGallery(page);
    await openLightbox(page, page.locator('.gallery-grid li a').first());

    await page.keyboard.press('ArrowRight');
    await expect(currentImage(page)).toHaveAttribute('src', await fullSrcForThumb(page, 1));

    await page.keyboard.press('ArrowRight');
    await expect(currentImage(page)).toHaveAttribute('src', await fullSrcForThumb(page, 2));

    await page.keyboard.press('ArrowLeft');
    await expect(currentImage(page)).toHaveAttribute('src', await fullSrcForThumb(page, 1));

    await page.keyboard.press('Escape');
    await expect(page.locator('.pswp')).toBeHidden();
  });

  test('Tab cycles the visible controls and never leaves the lightbox', async ({ page }) => {
    await openFirstGallery(page);
    await openLightbox(page, page.locator('.gallery-grid li a').first());

    // Walk a full lap of the focusable controls. Every stop must be inside the
    // .pswp element (focus trap) and, once it lands on a real control, must
    // carry a visible outline and an accessible label.
    const seen = new Set<string>();
    let landedOnControl = false;

    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const d = await activeDescriptor(page);
      expect(d, `Tab stop ${i} lost the activeElement`).not.toBeNull();
      expect(d!.insidePswp, `Tab stop ${i} (${d!.cls}) escaped the lightbox`).toBe(true);

      const isControl = d!.tag === 'button' || d!.tag === 'a';
      if (isControl) {
        landedOnControl = true;
        expect(d!.label, `control ${d!.cls} has no aria-label`).toBeTruthy();
        expect(d!.hasVisibleOutline, `control ${d!.cls} has no visible focus ring`).toBe(true);
        seen.add(d!.cls);
      }
    }

    expect(landedOnControl).toBe(true);
    // The close, zoom and both arrow buttons are all reachable by Tab.
    const reachable = [...seen].join(' ');
    expect(reachable).toContain('pswp__button--close');
    expect(reachable).toContain('pswp__button--zoom');
    expect(reachable).toContain('pswp__button--arrow--prev');
    expect(reachable).toContain('pswp__button--arrow--next');
  });

  test('Shift+Tab is also trapped inside the lightbox', async ({ page }) => {
    await openFirstGallery(page);
    await openLightbox(page, page.locator('.gallery-grid li a').first());

    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Shift+Tab');
      const d = await activeDescriptor(page);
      expect(d, `Shift+Tab stop ${i} lost the activeElement`).not.toBeNull();
      expect(d!.insidePswp, `Shift+Tab stop ${i} (${d!.cls}) escaped the lightbox`).toBe(true);
    }
  });

  test('the page behind the lightbox is inert to keyboard focus', async ({ page }) => {
    await openFirstGallery(page);
    await openLightbox(page, page.locator('.gallery-grid li a').first());

    // The primary nav sits in the page chrome behind the overlay. However far
    // we Tab, it must never take focus.
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      const onNav = await page.evaluate(
        () => !!(document.activeElement as HTMLElement | null)?.closest('nav'),
      );
      expect(onNav, `Tab stop ${i} reached the nav behind the lightbox`).toBe(false);
    }
  });

  test('closing with Esc returns focus to the thumbnail that opened it', async ({ page }) => {
    await openFirstGallery(page);
    const thumb = page.locator('.gallery-grid li a').nth(2);

    await openLightbox(page, thumb);
    // Move focus around inside the viewer first, so the return is a real hand-back.
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Escape');
    await expect(page.locator('.pswp')).toBeHidden();

    await expect(thumb).toBeFocused();
  });

  test('every PhotoSwipe control exposes an accessible label', async ({ page }) => {
    await openFirstGallery(page);
    await openLightbox(page, page.locator('.gallery-grid li a').first());

    for (const sel of [
      '.pswp__button--close',
      '.pswp__button--zoom',
      '.pswp__button--arrow--prev',
      '.pswp__button--arrow--next',
    ]) {
      const label = await page.locator(sel).getAttribute('aria-label');
      expect(label, `${sel} has no aria-label`).toBeTruthy();
    }
  });

  test('a control focused by keyboard shows a visible, light focus ring', async ({ page }) => {
    await openFirstGallery(page);
    await openLightbox(page, page.locator('.gallery-grid li a').first());

    // Tab until a real PhotoSwipe button takes focus, then inspect its outline.
    let outline: { style: string; width: number; color: string } | null = null;
    for (let i = 0; i < 8 && !outline; i++) {
      await page.keyboard.press('Tab');
      outline = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || !el.classList.contains('pswp__button')) return null;
        const s = getComputedStyle(el);
        return { style: s.outlineStyle, width: parseFloat(s.outlineWidth), color: s.outlineColor };
      });
    }

    expect(outline, 'no pswp button took keyboard focus').not.toBeNull();
    expect(outline!.style).not.toBe('none');
    expect(outline!.width).toBeGreaterThan(0);
    // Light ring — not the near-black site default that would vanish here.
    expect(outline!.color).toBe('rgb(255, 255, 255)');
  });
});
