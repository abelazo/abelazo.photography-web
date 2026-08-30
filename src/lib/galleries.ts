import { getCollection, type CollectionEntry } from 'astro:content';

export type Gallery = CollectionEntry<'galleries'>;

/** A gallery's URL slug: the frontmatter override, or the file name. */
export function gallerySlug(gallery: Gallery): string {
  return gallery.data.slug ?? gallery.id;
}

/** Root-relative URL of a gallery's detail page. */
export function galleryHref(gallery: Gallery): string {
  return `/galleries/${gallerySlug(gallery)}`;
}

/**
 * Published galleries, sorted by `order` ascending, then `date` newest-first.
 *
 * Drafts are excluded from production builds but kept in `astro dev` so they
 * can be previewed.
 */
export async function getGalleries(): Promise<Gallery[]> {
  const galleries = await getCollection(
    'galleries',
    ({ data }) => import.meta.env.DEV || !data.draft,
  );
  return galleries.sort(
    (a, b) => a.data.order - b.data.order || b.data.date.getTime() - a.data.date.getTime(),
  );
}

/** Galleries flagged `featured: true`, in the same order as {@link getGalleries}. */
export async function getFeaturedGalleries(): Promise<Gallery[]> {
  return (await getGalleries()).filter((gallery) => gallery.data.featured);
}
