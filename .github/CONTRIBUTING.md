# Contributing content

This site has one kind of content: **photo galleries**. This document is the
rulebook for adding and editing them. Follow the conventions here and the build
will accept your changes; break them and `pnpm build` fails with a pointed error
(that is by design — see the schema in `src/content.config.ts`).

If you just want to add a gallery, skip to the
[Adding a new gallery](#adding-a-new-gallery) checklist at the end.

## How a gallery is stored

Every gallery is two things that share one **slug**:

| Thing           | Path                              | What it is                                   |
| :-------------- | :-------------------------------- | :------------------------------------------- |
| A markdown file | `src/content/galleries/<slug>.md` | Title, description, date, and the photo list |
| An image folder | `src/assets/galleries/<slug>/`    | The actual `.jpg` files                      |

`coastal-mornings` and `harbour-lights` already exist as working samples. The
fastest way to make a new gallery is to copy one of them and replace its parts.

## Naming conventions

### The slug

The slug is the gallery's identity: it names the markdown file, names the image
folder, and becomes the URL (`/galleries/<slug>/`).

- **kebab-case only** — lowercase letters and digits, words joined by single
  hyphens: `coastal-mornings`, `iceland-2025`, `street-work-vol-2`.
- No spaces, capitals, underscores, accents, or trailing hyphens. The schema
  rejects anything else.
- Pick it once and don't change it — the URL is permanent. To rename, you are
  really deleting one gallery and adding another.

By default the slug is taken from the markdown file name. You only set the
`slug:` frontmatter field to make the URL differ from the file name, which is
rarely worth doing.

### Image file names

Inside `src/assets/galleries/<slug>/`, name every file:

```
NN-short-description.jpg
```

- **`NN`** — a two-digit number with a leading zero: `01`, `02`, … `10`, `11`.
  This keeps the folder sorted in display order when you look at it in Finder or
  a file listing.
- **`short-description`** — kebab-case, a couple of words describing the frame
  (`01-tide-line.jpg`, `04-first-light.jpg`). It is for your benefit when
  scanning the folder; the site never shows it.
- **`.jpg`** — lowercase extension, always JPEG (see
  [Image requirements](#image-requirements)).

The number prefix is a **convention, not the mechanism**. Actual display order
is the order of the `photos:` list in the markdown file. Keep the two in sync:
if `photos:` runs `01, 02, 03, 04`, the gallery shows them in that order. Number
your files to match the list so the folder and the markdown never drift apart.

To reorder a gallery later, reorder the `photos:` list and renumber the files to
match.

## Image requirements

Gallery photos are optimised at build time by `astro:assets` (backed by
`sharp`): the site generates resized, modern-format derivatives and serves those.
You commit **one source file per photo**, and it should be the largest size the
site will ever need — no larger.

| Property     | Requirement                                                                                         |
| :----------- | :-------------------------------------------------------------------------------------------------- |
| Format       | JPEG (`.jpg`). Export at quality ~85.                                                               |
| Colour space | sRGB. Convert before export — wide-gamut files render wrong in browsers.                            |
| Resolution   | Long edge **2560 px**. Smaller is fine for a photo that is never shown large; never larger.         |
| File size    | Aim for **under 700 KB** per file, hard ceiling 1.5 MB. Re-export at lower quality if you are over. |
| Metadata     | Strip EXIF/GPS on export. Keep a copyright tag if you want one; drop location data.                 |
| Orientation  | Bake rotation in. Don't rely on an EXIF orientation flag.                                           |

Why the ceiling matters: every source file lives in git forever. A folder of
8 MB exports bloats every clone and every deploy. See issue [#22] for the
repo-size budget.

### Cover image

`cover:` in the frontmatter points at **one** of the gallery's own photos — the
single frame that represents the whole set on the home page and gallery list.

- Use a path relative to the markdown file:
  `../../assets/galleries/<slug>/01-tide-line.jpg`.
- It is almost always the first photo (`01-…`), but it does not have to be.
- Landscape frames sit best in the grid. A strong, uncluttered image reads
  better at thumbnail size than a busy one.
- The cover can also appear inside the gallery — listing it in `photos:` as well
  is fine and normal.

### Alt text

Every entry in `photos:` needs an `alt:` string. The build **fails** on a
missing or empty one — there are no decorative images in a photography
portfolio.

Write it for someone who cannot see the photo:

- One sentence, plain description of what is in the frame.
- Don't start with "Photo of" / "Image of" — screen readers already announce it
  as an image.
- Describe the subject and mood, not the camera settings.
- Don't just repeat the gallery title or description.

Good: `A dark tide line curving across pale wet sand at dawn.`
Weak: `Beach photo` · `IMG_4021` · `Coastal Mornings`

## Frontmatter reference

```yaml
---
title: Coastal Mornings # shown in headings and nav
description: First light along a cold shoreline. # 1–2 sentences, reused as meta description
date: 2026-02-14 # capture date, YYYY-MM-DD
featured: true # optional, default false — surfaces on the home page
order: 1 # optional, default 0 — manual sort key, ascending; ties break by date, newest first
cover: ../../assets/galleries/coastal-mornings/01-tide-line.jpg
photos:
  - src: ../../assets/galleries/coastal-mornings/01-tide-line.jpg
    alt: A dark tide line curving across pale wet sand at dawn.
  - src: ../../assets/galleries/coastal-mornings/02-low-cloud.jpg
    alt: Low grey cloud pressing down over a flat, calm sea.
---
Optional prose body. Markdown. Shown on the gallery page above or beside the
photos. Leave it out if you have nothing to say.
```

`slug:` is the only other accepted field (see [The slug](#the-slug)). Any field
not listed here fails the build.

Full field types are also tabulated in the [README](../README.md#content).

## Adding a new gallery

A start-to-finish checklist. You need the repo checked out and set up once
(`README` → Setup).

1. **Choose a slug** — kebab-case, permanent, e.g. `winter-harbour`. See
   [The slug](#the-slug).

2. **Prepare the photos** — export 3–15 JPEGs that meet
   [Image requirements](#image-requirements): sRGB, long edge 2560 px, quality
   ~85, EXIF stripped, under ~700 KB each.

3. **Create the image folder** and name the files with number prefixes in the
   order you want them shown:

   ```
   src/assets/galleries/winter-harbour/
   ├── 01-frozen-moorings.jpg
   ├── 02-ice-on-the-slip.jpg
   └── 03-last-light.jpg
   ```

4. **Copy a sample markdown file** to `src/content/galleries/winter-harbour.md`:

   ```sh
   cp src/content/galleries/harbour-lights.md src/content/galleries/winter-harbour.md
   ```

5. **Edit the frontmatter** (see [Frontmatter reference](#frontmatter-reference)):
   - `title`, `description`, `date`.
   - `cover:` → one of your photos, usually `01-…`.
   - Replace the `photos:` list with one `- src: … / alt: …` block per file, in
     display order. Write real alt text for each.
   - Set `featured: true` only if it should appear on the home page. Set `order:`
     if you care where it sorts.
   - Delete or rewrite the prose body below the `---`.

6. **Preview it** — `pnpm dev`, open <http://localhost:4321>, check the gallery
   looks right and the cover is the frame you meant.

7. **Validate** — `pnpm build`. This runs the schema check; a red error names the
   exact field and file to fix. Also run `pnpm format` so the markdown is
   formatted consistently.

8. **Commit** — one commit for the gallery. The message must follow the
   [commit convention](../README.md#commit-convention) and end with an issue or
   PR number:

   ```
   feat(content): add winter-harbour gallery (#NN)
   ```

9. **Open a pull request.** Netlify builds a preview deploy; check the gallery on
   that URL before merging.

## Editing or removing a gallery

- **Reorder photos** — reorder the `photos:` list and renumber the files to
  match.
- **Swap a photo** — drop the new file in, update its `src`/`alt`, keep the
  numbering consistent.
- **Rename a gallery** — you can't, cleanly: the slug is the permanent URL.
  Removing the old one and adding a new one is the honest description of what
  that is.
- **Remove a gallery** — delete both `src/content/galleries/<slug>.md` and
  `src/assets/galleries/<slug>/`. Nothing else references it.

[#22]: https://github.com/abelazo/abelazo.photography-web/issues/22
