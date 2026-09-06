import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Shared helpers for the gallery / lightbox specs.
 *
 * They all drive one fixture: `test-gallery`, a `draft: true` gallery that
 * exists only for this suite (`src/content/galleries/test-gallery.md`,
 * images from `scripts/gen-test-gallery.mjs`). It gives every spec a stable
 * thing to assert against — 9 photos, a known order, mixed portrait/landscape
 * frames, per-photo titles on the first two, and a high-resolution frame last
 * so the desktop-zoom spec has real detail to pan. Being a draft it renders
 * only under `astro dev` (the server Playwright drives) — never in a
 * production build or the sitemap.
 */
export const TEST_GALLERY_PATH = '/galleries/test-gallery';
export const TEST_GALLERY_TITLE = 'Galería de prueba';
export const TEST_GALLERY_PHOTO_COUNT = 9;

/** A second draft fixture (`test-gallery-bare.md`) with no optional frontmatter —
 *  no `location`, no `tags`, no per-photo `title`. Covers the "absent" path for
 *  the metadata specs. Shares `test-gallery`'s images. */
export const BARE_GALLERY_PATH = '/galleries/test-gallery-bare';
export const BARE_GALLERY_TITLE = 'Galería de prueba mínima';

/** Alt text of every frame, in frontmatter order — the display order the grid must keep. */
export const TEST_GALLERY_ALTS = [
  'Fotograma de prueba número uno, un degradado apaisado gris azulado.',
  'Fotograma de prueba número dos, un degradado vertical gris azulado.',
  'Fotograma de prueba número tres, un degradado cuadrado gris azulado.',
  'Fotograma de prueba número cuatro, un degradado apaisado gris azulado.',
  'Fotograma de prueba número cinco, un degradado vertical gris azulado.',
  'Fotograma de prueba número seis, un degradado apaisado gris azulado.',
  'Fotograma de prueba número siete, un degradado vertical gris azulado.',
  'Fotograma de prueba número ocho, un degradado apaisado gris azulado.',
  'Fotograma de prueba número nueve, un degradado apaisado gris azulado en alta resolución.',
];

/** Open the fixture gallery detail page and wait for the lightbox script to bind.
 *  Until `data-pswp-ready` lands the anchors just navigate to the image. */
export async function openTestGallery(page: Page): Promise<void> {
  await page.goto(TEST_GALLERY_PATH);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(TEST_GALLERY_TITLE);
  await expect(page.locator('.gallery-grid')).toHaveAttribute('data-pswp-ready', '');
}

/** Click a thumbnail and wait for PhotoSwipe to finish its open animation
 *  (it ignores input until then). */
export async function openLightbox(page: Page, thumb: Locator): Promise<void> {
  await thumb.click();
  await expect(page.locator('.pswp')).toHaveClass(/pswp--ui-visible/);
  await expect(page.locator('.pswp__img:not(.pswp__img--placeholder)').first()).toBeVisible();
}

/** The image shown on the currently-active slide. */
export function currentImage(page: Page): Locator {
  return page.locator(
    '.pswp__item:not([aria-hidden="true"]) img.pswp__img:not(.pswp__img--placeholder)',
  );
}

/** The zoom/pan transform wrapper of the currently-active slide. */
export function currentZoomWrap(page: Page): Locator {
  return page.locator('.pswp__item:not([aria-hidden="true"]) .pswp__zoom-wrap');
}

/** Absolute src the viewer will use for the thumbnail at `index`. */
export async function fullSrcForThumb(page: Page, index: number): Promise<string> {
  const href = (await page.locator('.gallery-grid li a').nth(index).getAttribute('href')) as string;
  return new URL(href, page.url()).href;
}
