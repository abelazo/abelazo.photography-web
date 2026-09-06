/**
 * Generate placeholder gallery images.
 *
 * The studio galleries (`personal`, `profesional`, `moda`, `editorial`) ship as
 * drafts with marker images so the site builds and can be previewed before real
 * photos exist. This writes a soft, category-tinted gradient JPEG per photo, in
 * mixed aspect ratios so the masonry grid looks right.
 *
 * Run: `node scripts/gen-placeholders.mjs`
 * Then replace the files in `src/assets/galleries/<slug>/` with real photos
 * (see `.github/CONTRIBUTING.md`) — this script is only for the placeholder pass.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(root, 'src/assets/galleries');

/** Two-stop tint per category — a light and a deeper shade of one hue. */
const CATEGORIES = {
  personal: { light: '#e7d3c4', deep: '#b07f62' },
  profesional: { light: '#d3dae3', deep: '#5f7590' },
  moda: { light: '#ddd2e0', deep: '#7d5f8f' },
  editorial: { light: '#e2dccb', deep: '#8f7d52' },
};

/** Photo shapes, cycled per gallery — cover first, then a portrait/landscape mix. */
const SHAPES = [
  { w: 1600, h: 1067 }, // 3:2 landscape (cover)
  { w: 1067, h: 1600 }, // 2:3 portrait
  { w: 1600, h: 1067 }, // 3:2 landscape
  { w: 1280, h: 1600 }, // 4:5 portrait
  { w: 1600, h: 1200 }, // 4:3 landscape
  { w: 1067, h: 1600 }, // 2:3 portrait
];

const NAMES = [
  '01-placeholder',
  '02-placeholder',
  '03-placeholder',
  '04-placeholder',
  '05-placeholder',
  '06-placeholder',
];

const PHOTOS_PER_GALLERY = 4;

function svg({ w, h, light, deep, angle }) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle})">
      <stop offset="0" stop-color="${light}"/>
      <stop offset="1" stop-color="${deep}"/>
    </linearGradient>
    <radialGradient id="v" cx="50%" cy="42%" r="75%">
      <stop offset="0" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.18"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#v)"/>
</svg>`);
}

for (const [slug, tint] of Object.entries(CATEGORIES)) {
  const dir = join(assets, slug);
  await mkdir(dir, { recursive: true });

  for (let i = 0; i < PHOTOS_PER_GALLERY; i++) {
    const shape = SHAPES[i % SHAPES.length];
    const angle = 25 + i * 40;
    const jpeg = await sharp(svg({ ...shape, ...tint, angle }))
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    const file = join(dir, `${NAMES[i]}.jpg`);
    await writeFile(file, jpeg);
    console.log(`${(jpeg.length / 1024).toFixed(0).padStart(4)} KB  ${slug}/${NAMES[i]}.jpg`);
  }
}

console.log('\nDone. Replace these with real photos before publishing the galleries.');
