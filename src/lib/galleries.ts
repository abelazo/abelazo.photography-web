import type { GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { type Lang } from '../i18n/ui';

export type Gallery = CollectionEntry<'galleries'>;

/**
 * A gallery's title and description in the requested locale.
 *
 * The frontmatter `title`/`description` are the Spanish (default) copy; an
 * optional `i18n.en` block overrides them for the English pages. A missing
 * override falls back to the default-locale value, so a half-translated gallery
 * still renders.
 */
export function localizedGallery(
  gallery: Gallery,
  lang: Lang,
): { title: string; description: string } {
  const override = lang === 'en' ? gallery.data.i18n?.en : undefined;
  return {
    title: override?.title ?? gallery.data.title,
    description: override?.description ?? gallery.data.description,
  };
}

/** A gallery's URL slug: the frontmatter override, or the file name. */
export function gallerySlug(gallery: Gallery): string {
  return gallery.data.slug ?? gallery.id;
}

/** Root-relative URL of a gallery's detail page. */
export function galleryHref(gallery: Gallery): string {
  return `/galleries/${gallerySlug(gallery)}`;
}

/**
 * Listing sort order: `order` ascending, then `date` newest-first for ties.
 *
 * This is the whole of "reorder the home page": a lower `order` pins a gallery
 * earlier regardless of its date; galleries that share an `order` (the default
 * is `0`) fall back to date. Both listings — home page and detail page — use it.
 *
 * Exported for unit tests; see `galleries.test.ts`.
 */
export function byDisplayOrder(a: Gallery, b: Gallery): number {
  return a.data.order - b.data.order || b.data.date.getTime() - a.data.date.getTime();
}

/**
 * Whether a gallery shows up in listings and gets a built page.
 *
 * A `draft: true` gallery is hidden from the production build but kept in
 * `astro dev` (`dev` defaults to {@link import.meta.env.DEV}) so it can be
 * previewed before publishing. Unpublishing a live gallery is just flipping
 * this flag — its files stay in the repo.
 *
 * Exported for unit tests; see `galleries.test.ts`.
 */
export function isListed(gallery: Gallery, dev: boolean = import.meta.env.DEV): boolean {
  return dev || !gallery.data.draft;
}

/**
 * Published galleries, sorted by {@link byDisplayOrder}.
 *
 * Drafts are excluded from production builds but kept in `astro dev` so they
 * can be previewed — see {@link isListed}.
 */
export async function getGalleries(): Promise<Gallery[]> {
  const galleries = await getCollection('galleries', (entry) => isListed(entry));
  return galleries.sort(byDisplayOrder);
}

/** Galleries flagged `featured: true`, in the same order as {@link getGalleries}. */
export async function getFeaturedGalleries(): Promise<Gallery[]> {
  return (await getGalleries()).filter((gallery) => gallery.data.featured);
}

/**
 * `getStaticPaths` for the gallery detail route — one page per published
 * gallery, keyed by {@link gallerySlug}. Shared verbatim by the ES route
 * (`src/pages/galleries/[slug].astro`) and its EN mirror
 * (`src/pages/en/galleries/[slug].astro`); the locale is the only thing that
 * differs between them and that lives in the page, not the paths.
 */
export const galleryDetailPaths = (async () => {
  const galleries = await getGalleries();
  return galleries.map((gallery) => ({
    params: { slug: gallerySlug(gallery) },
    props: { gallery },
  }));
}) satisfies GetStaticPaths;
