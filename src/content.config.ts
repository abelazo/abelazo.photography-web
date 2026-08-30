import { defineCollection, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Kebab-case: lowercase alphanumerics separated by single hyphens. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Frontmatter schema for a gallery.
 *
 * Exported as a factory so it can be unit-tested with a stub `image()` — see
 * `config.test.ts`. `astro:content` injects the real `image()` at build time,
 * which turns a path relative to the markdown file into an optimisable
 * `ImageMetadata` object.
 */
export function galleriesSchema({ image }: SchemaContext) {
  return z
    .object({
      /** Human-readable name shown in headings and nav. */
      title: z.string().min(1),
      /**
       * URL slug. Optional: defaults to the file name (`coastal-mornings.md`
       * → `coastal-mornings`). Only set this to override that default.
       */
      slug: z.string().regex(SLUG, 'slug must be kebab-case').optional(),
      /** One or two sentences, reused for list pages and meta descriptions. */
      description: z.string().min(1),
      /** Capture date. `YYYY-MM-DD` in frontmatter, a `Date` once parsed. */
      date: z.coerce.date(),
      /** Cover image, as a path relative to this markdown file. */
      cover: image(),
      /** Surface this gallery on the home page. */
      featured: z.boolean().default(false),
      /**
       * Work in progress. A draft is hidden from every production listing and
       * has no page in the built site; it still renders in `astro dev` so it
       * can be previewed.
       */
      draft: z.boolean().default(false),
      /** Manual sort key, ascending. Ties fall back to `date`, newest first. */
      order: z.number().int().nonnegative().default(0),
      /** Ordered photos. Array order is display order. */
      photos: z
        .array(
          z.object({
            /** Path to the image file, relative to this markdown file. */
            src: image(),
            /** Required — no decorative photos in a photography portfolio. */
            alt: z.string().min(1, 'every photo needs alt text'),
          }),
        )
        .min(1, 'a gallery needs at least one photo'),
    })
    .strict();
}

const galleries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/galleries' }),
  schema: galleriesSchema,
});

export const collections = { galleries };
