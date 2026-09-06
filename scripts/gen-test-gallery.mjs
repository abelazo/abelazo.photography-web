/**
 * Generate the images for the E2E fixture gallery (`src/content/galleries/test-gallery.md`).
 *
 * `test-gallery` is a `draft: true` gallery that exists only to give the
 * Playwright suite a stable, richly-populated gallery to assert against:
 * a known photo count, a known order, mixed portrait/landscape aspect ratios,
 * per-photo titles on the first two photos, and one deliberately high-resolution
 * frame (09) so the desktop-zoom spec has real detail to pan around.
 *
 * Being a draft, it never reaches a production build or the sitemap — it is
 * visible only under `astro dev`, which is the server Playwright drives.
 *
 * Run: `node scripts/gen-test-gallery.mjs`
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src/assets/galleries/test-gallery');

/** One flat teal-grey hue — this is scaffolding, not design. */
const LIGHT = '#dfe4e4';
const DEEP = '#6b7d7d';

/** 9 frames: a portrait/landscape mix, 09 deliberately high-res for the zoom spec. */
const SHAPES = [
  { w: 2400, h: 1600 }, // 01 — 3:2 landscape (cover)
  { w: 1200, h: 1600 }, // 02 — 3:4 portrait
  { w: 1600, h: 1600 }, // 03 — square
  { w: 1600, h: 1067 }, // 04 — 3:2 landscape
  { w: 1067, h: 1600 }, // 05 — 2:3 portrait
  { w: 1600, h: 1200 }, // 06 — 4:3 landscape
  { w: 1280, h: 1600 }, // 07 — 4:5 portrait
  { w: 1600, h: 1000 }, // 08 — 8:5 landscape
  { w: 2560, h: 1707 }, // 09 — 3:2 landscape, high-res (desktop-zoom fixture)
];

await mkdir(dir, { recursive: true });

for (let i = 0; i < SHAPES.length; i++) {
  const { w, h } = SHAPES[i];
  const n = String(i + 1).padStart(2, '0');
  const angle = 20 + i * 30;
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle})">
      <stop offset="0" stop-color="${LIGHT}"/>
      <stop offset="1" stop-color="${DEEP}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <text x="50%" y="50%" font-family="sans-serif" font-size="${Math.round(w / 8)}"
        fill="#ffffff" fill-opacity="0.55" text-anchor="middle" dominant-baseline="central">${n}</text>
</svg>`);
  const jpeg = await sharp(svg).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  const file = join(dir, `${n}-frame.jpg`);
  await writeFile(file, jpeg);
  console.log(
    `${(jpeg.length / 1024).toFixed(0).padStart(4)} KB  test-gallery/${n}-frame.jpg  (${w}x${h})`,
  );
}

console.log('\nDone. Fixture images for the E2E suite — see scripts/gen-test-gallery.mjs.');
