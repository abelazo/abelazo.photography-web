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
    expect(result.draft).toBe(false);
    expect(result.order).toBe(0);
  });

  it('accepts an explicit draft flag', () => {
    expect(schema.parse({ ...valid, draft: true }).draft).toBe(true);
  });

  it('omits location and tags when absent', () => {
    const result = schema.parse(valid);
    expect(result.location).toBeUndefined();
    expect(result.tags).toBeUndefined();
  });

  it('accepts optional location and tags', () => {
    const result = schema.parse({ ...valid, location: 'Northumberland coast', tags: ['coastal'] });
    expect(result.location).toBe('Northumberland coast');
    expect(result.tags).toEqual(['coastal']);
  });

  it('rejects an empty tags array', () => {
    expect(schema.safeParse({ ...valid, tags: [] }).success).toBe(false);
  });

  it('rejects a blank tag', () => {
    expect(schema.safeParse({ ...valid, tags: [''] }).success).toBe(false);
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

  it('fails an empty alt with an actionable, photo-scoped message', () => {
    const result = schema.safeParse({ ...valid, photos: [{ src: 'a.jpg', alt: '' }] });
    expect(result.success).toBe(false);
    const issue = result.error!.issues[0];
    expect(issue.path).toEqual(['photos', 0, 'alt']);
    expect(issue.message).toMatch(/one-sentence description/);
  });

  it('fails a missing alt with an actionable, photo-scoped message', () => {
    const result = schema.safeParse({ ...valid, photos: [{ src: 'a.jpg' }] });
    expect(result.success).toBe(false);
    const issue = result.error!.issues[0];
    expect(issue.path).toEqual(['photos', 0, 'alt']);
    expect(issue.message).toMatch(/one-sentence description/);
  });

  it('preserves the photos list order as given', () => {
    const photos = [
      { src: '1.jpg', alt: 'first' },
      { src: '2.jpg', alt: 'second' },
      { src: '3.jpg', alt: 'third' },
    ];
    expect(schema.parse({ ...valid, photos }).photos.map((p) => p.alt)).toEqual([
      'first',
      'second',
      'third',
    ]);
  });

  it('accepts an optional per-photo title and omits it when absent', () => {
    const result = schema.parse({
      ...valid,
      photos: [
        { src: 'a.jpg', alt: 'A dark tide line.', title: 'Tide line' },
        { src: 'b.jpg', alt: 'Low cloud over the sea.' },
      ],
    });
    expect(result.photos[0].title).toBe('Tide line');
    expect(result.photos[1].title).toBeUndefined();
  });

  it('rejects a blank per-photo title', () => {
    expect(
      schema.safeParse({ ...valid, photos: [{ src: 'a.jpg', alt: 'ok', title: '' }] }).success,
    ).toBe(false);
  });

  it('rejects an unknown per-photo field', () => {
    expect(
      schema.safeParse({ ...valid, photos: [{ src: 'a.jpg', alt: 'ok', caption: 'x' }] }).success,
    ).toBe(false);
  });

  it('rejects a non-kebab-case slug override', () => {
    expect(schema.safeParse({ ...valid, slug: 'Coastal Mornings' }).success).toBe(false);
  });
});
