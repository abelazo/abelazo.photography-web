# Contributing content

This site has one kind of content: **photo galleries**. This document is the
rulebook for adding and editing them. Follow the conventions here and the build
will accept your changes; break them and `pnpm build` fails with a pointed error
(that is by design — see the schema in `src/content.config.ts`).

If you just want to add a gallery, skip to the
[Adding a new gallery](#adding-a-new-gallery) checklist near the end.

## How a gallery is stored

Every gallery is two things that share one **slug**:

| Thing           | Path                              | What it is                                   |
| :-------------- | :-------------------------------- | :------------------------------------------- |
| A markdown file | `src/content/galleries/<slug>.md` | Title, description, date, and the photo list |
| An image folder | `src/assets/galleries/<slug>/`    | The actual `.jpg` files                      |

`coastal-mornings` and `harbour-lights` already exist as working samples. The
fastest way to make a new gallery is to copy one of them and replace its parts.

There is **no index, registry, or route to edit**. Both pages that list
galleries — the home page and each detail page — read the collection at build
time through the helpers in `src/lib/galleries.ts`. Drop in the two paths above
and the gallery appears; nothing else in the codebase references it.

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
- **`.jpg`** — lowercase extension, JPEG.

The number prefix is a **convention, not the mechanism**. Actual display order
is the order of the `photos:` list in the markdown file. Keep the two in sync:
if `photos:` runs `01, 02, 03, 04`, the gallery shows them in that order. Number
your files to match the list so the folder and the markdown never drift apart.

To reorder a gallery later, reorder the `photos:` list and renumber the files to
match.

## Images

**You do not resize or compress anything for display.** Gallery photos are
optimised at build time by `astro:assets` (backed by `sharp`): from each source
file the build generates resized, modern-format (`webp`) derivatives and serves
those — a small thumbnail in the grid, a larger rendition for the fullscreen
viewer. The `<Image />` component picks the right one per layout and screen.
Commit the photo; the build does the rest. No step in the publish flow requires
Photoshop, an export preset, or a "web" size.

The one real constraint is **git**: every source file you commit lives in the
repository forever and ships in every clone and every deploy. So the source
should be the largest size the site will ever need — and no larger.

| Property     | Guidance                                                                                                       |
| :----------- | :------------------------------------------------------------------------------------------------------------- |
| Format       | JPEG (`.jpg`). A high-quality export straight from your editor is fine.                                        |
| Colour space | sRGB. Convert wide-gamut files before export — they render wrong in browsers.                                  |
| Resolution   | Long edge around **2560 px**. The build never serves a derivative wider than 2400 px, so more is dead weight.  |
| File size    | Aim **under ~1 MB** per file. If a file is several MB, re-export it smaller — the build won't need the pixels. |
| Metadata     | Strip EXIF/GPS on export. Keep a copyright tag if you want; drop location data.                                |
| Orientation  | Bake rotation in. Don't rely on an EXIF orientation flag.                                                      |

Nothing here is checked by `pnpm build` — a 12 MP straight-off-the-camera JPEG
builds fine. It is a repo-hygiene budget (see issue [#22]), not a schema rule.

### Cover image

`cover:` in the frontmatter points at **one** image — the single frame that
represents the whole set on the home page and gallery list.

- Use a path relative to the markdown file:
  `../../assets/galleries/<slug>/01-tide-line.jpg`.
- It is almost always the first photo (`01-…`), but it does not have to be.
- It is usually also listed in `photos:` — that is fine and normal. It does not
  have to be.
- Landscape frames sit best in the grid. A strong, uncluttered image reads
  better at thumbnail size than a busy one.

### Alt text

Every entry in `photos:` needs an `alt:` string. The build **fails** on a
missing or empty one — there are no decorative images in a photography
portfolio. (The cover does not take alt text; it is presented decoratively next
to the title it illustrates.)

Write it for someone who cannot see the photo:

- One sentence, plain description of what is in the frame.
- Don't start with "Photo of" / "Image of" — screen readers already announce it
  as an image.
- Describe the subject and mood, not the camera settings.
- Don't just repeat the gallery title or description.

Good: `A dark tide line curving across pale wet sand at dawn.`
Weak: `Beach photo` · `IMG_4021` · `Coastal Mornings`

## Frontmatter reference

The schema in `src/content.config.ts` is **strict**: every field below is
accepted, anything else fails the build.

```yaml
---
title: Coastal Mornings # required — shown in headings and nav
description: First light along a cold shoreline. # required — 1–2 sentences, reused as meta description
date: 2026-02-14 # required — capture date, YYYY-MM-DD
cover: ../../assets/galleries/coastal-mornings/01-tide-line.jpg # required — path relative to this file
photos: # required — at least one; array order is display order
  - src: ../../assets/galleries/coastal-mornings/01-tide-line.jpg
    alt: A dark tide line curving across pale wet sand at dawn.
  - src: ../../assets/galleries/coastal-mornings/02-low-cloud.jpg
    alt: Low grey cloud pressing down over a flat, calm sea.

# --- everything below is optional ---
location: Northumberland coast # rendered on the detail page only when set
tags: # rendered only when non-empty; must have at least one entry if present
  - landscape
  - coastal
featured: false # default false — true surfaces the gallery on the home page
draft: false # default false — see "Drafts" below
order: 1 # default 0 — manual sort key, ascending; ties break by date, newest first
slug: coastal-mornings # default: the file name; only set to make the URL differ
---
Optional prose body. Markdown. Shown on the gallery page above the photos. Leave
it out if you have nothing to say.
```

| Field         | Required | Type              | Notes                                                              |
| :------------ | :------: | :---------------- | :----------------------------------------------------------------- |
| `title`       |   yes    | string            | Headings and nav.                                                  |
| `description` |   yes    | string            | 1–2 sentences; reused as the meta description.                     |
| `date`        |   yes    | `YYYY-MM-DD`      | Capture date.                                                      |
| `cover`       |   yes    | image path        | Relative to the markdown file.                                     |
| `photos`      |   yes    | list              | `{ src, alt }` each; array order is display order; `alt` required. |
| `location`    |    no    | string            | Shown on the detail page when set.                                 |
| `tags`        |    no    | list of strings   | Shown on the detail page when non-empty.                           |
| `featured`    |    no    | boolean (`false`) | `true` → also appears on the home page.                            |
| `draft`       |    no    | boolean (`false`) | `true` → hidden from the built site, visible in `pnpm dev`.        |
| `order`       |    no    | integer (`0`)     | Ascending sort key; ties break by `date`, newest first.            |
| `slug`        |    no    | string            | URL slug; defaults to the file name.                               |

### Drafts

Set `draft: true` to work on a gallery in the open without publishing it. A
draft renders in `pnpm dev` so you can preview it, but is excluded from the
production build entirely — no home-page card, no detail page. Flip it to
`false` (or delete the line) in the commit that publishes.

### Sorting

Both listings sort the same way: `order` ascending, then `date` newest-first for
ties. New galleries with no `order` get `0` and sort purely by date. Use `order`
only when you want to pin something out of date sequence.

## Adding a new gallery

Start-to-finish. Assumes the repo is checked out and set up once (see the
[README](../README.md#setup)). Trunk-based: you work on `main`, no branch, no
pull request.

1. **Choose a slug** — kebab-case, permanent, e.g. `winter-harbour`. See
   [The slug](#the-slug).

2. **Create the image folder** and drop the photos in, named with number
   prefixes in the order you want them shown. No resizing — commit the files as
   exported (see [Images](#images) for the git-size budget):

   ```
   src/assets/galleries/winter-harbour/
   ├── 01-frozen-moorings.jpg
   ├── 02-ice-on-the-slip.jpg
   └── 03-last-light.jpg
   ```

3. **Copy a sample markdown file** to `src/content/galleries/winter-harbour.md`:

   ```sh
   cp src/content/galleries/harbour-lights.md src/content/galleries/winter-harbour.md
   ```

4. **Write the frontmatter** (see
   [Frontmatter reference](#frontmatter-reference)):
   - `title`, `description`, `date`.
   - `cover:` → one of your photos, usually `01-…`.
   - Replace the `photos:` list with one `- src: … / alt: …` block per file, in
     display order. Write real alt text for each.
   - `featured: true` only if it should appear on the home page. `order:` only
     if you need it out of date sequence. `location:` / `tags:` if you want
     them.
   - Delete or rewrite the prose body below the closing `---`.

5. **Preview it** — `pnpm dev`, open <http://localhost:4321>. Check the card on
   the home page, open the gallery, click a photo into the fullscreen viewer,
   step through with the arrows. The cover should be the frame you meant.

6. **Validate and format** — `pnpm build` runs the schema check; a red error
   names the exact field and file to fix. Then `pnpm format` so the markdown is
   consistent. Optionally `pnpm test:e2e` to run the full visitor-facing suite
   against your addition.

7. **Run the pre-commit hooks** — `prek run --all-files` (or
   `pre-commit run --all-files`). Fix anything they flag.

8. **Commit to `main`.** One commit for the gallery. The message must follow the
   [commit convention](../README.md#commit-convention) and end with an issue or
   PR number. Use `feat` — it is what triggers a release and therefore a deploy:

   ```
   feat(content): add winter-harbour gallery (#NN)
   ```

   The owner reviews the working tree and commits; see the project's
   `CLAUDE.md` if you are unsure whether to commit yourself.

9. **Push.** `.github/workflows/deploy.yml` takes over:
   `verify` (lint, format, unit tests, build, E2E) → `release`
   (semantic-release cuts `vX.Y.Z` from the `feat` commit) → `deploy`
   (`netlify deploy --prod` of the prebuilt `dist/`). A few minutes later the
   gallery is live at `/galleries/winter-harbour/` and on the home page. If
   `verify` fails, GitHub emails the owner and nothing deploys.

There is no manual deploy step and no Netlify dashboard to touch — CI is the
only route to production.

## Editing or removing a gallery

- **Reorder photos** — reorder the `photos:` list and renumber the files to
  match.
- **Swap a photo** — drop the new file in, update its `src`/`alt`, keep the
  numbering consistent, delete the old file.
- **Reorder galleries** — set `order:` on the ones you want to pin; leave the
  rest to sort by date.
- **Unpublish temporarily** — set `draft: true` and push. It drops off the live
  site on the next deploy and stays previewable in `pnpm dev`.
- **Rename a gallery** — you can't, cleanly: the slug is the permanent URL.
  Removing the old one and adding a new one is the honest description of what
  that is.
- **Remove a gallery** — delete both `src/content/galleries/<slug>.md` and
  `src/assets/galleries/<slug>/`. Nothing else references it. Commit as `fix` or
  `chore` per the [commit convention](../README.md#commit-convention).

[#22]: https://github.com/abelazo/abelazo.photography-web/issues/22
