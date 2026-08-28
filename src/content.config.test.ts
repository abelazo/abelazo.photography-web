import { describe, expect, it } from 'vitest';
import type { SchemaContext } from 'astro:content';
import { z } from 'astro/zod';
import { galleriesSchema } from './content.config';

// `image()` is an Astro build-time helper; a plain string stand-in is enough to
// exercise every other rule in the schema.
const ctx = { image: () => z.string() } as unknown as SchemaContext;
const schema = galleriesSchema(ctx);

const valid = {
  title: 'Coastal Mornings',
  description: 'First light along a cold shoreline.',
  date: '2026-02-14',
  cover: 'cover.jpg',
  photos: [{ src: 'a.jpg', alt: 'A dark tide line across wet sand.' }],
};

describe('galleriesSchema', () => {
  it('accepts well-formed frontmatter and applies defaults', () => {
    const result = schema.parse(valid);
    expect(result.date).toBeInstanceOf(Date);
    expect(result.featured).toBe(false);
    expect(result.order).toBe(0);
  });

  it('rejects a missing required field', () => {
    const noTitle: Record<string, unknown> = { ...valid };
    delete noTitle.title;
    expect(schema.safeParse(noTitle).success).toBe(false);
  });

  it('rejects a field of the wrong type', () => {
    expect(schema.safeParse({ ...valid, order: 'first' }).success).toBe(false);
  });

  it('rejects an unknown field', () => {
    expect(schema.safeParse({ ...valid, colour: 'blue' }).success).toBe(false);
  });

  it('rejects a gallery with no photos', () => {
    expect(schema.safeParse({ ...valid, photos: [] }).success).toBe(false);
  });

  it('rejects a photo with no alt text', () => {
    expect(schema.safeParse({ ...valid, photos: [{ src: 'a.jpg', alt: '' }] }).success).toBe(false);
  });

  it('rejects a non-kebab-case slug override', () => {
    expect(schema.safeParse({ ...valid, slug: 'Coastal Mornings' }).success).toBe(false);
  });
});
