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
file the build generates resized derivatives in modern formats — `AVIF` and
`WebP`, with a JPEG fallback — and serves those via a `<picture>` element, so
each browser downloads the smallest format it supports. The grid gets a
responsive `srcset` (the browser picks the width for its layout and screen); the
fullscreen viewer gets a single larger `WebP` rendition. Commit the photo; the
build does the rest. No step in the publish flow requires Photoshop, an export
preset, or a "web" size.

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

A missing or empty `alt:` **fails `pnpm build`** with an error that names the
offending photo by its index in the list and the `alt` field. This is enforced,
not advisory.

### Photo title

`title:` on a `photos:` entry is **optional**. When set it becomes the link's
tooltip in the grid (`<a title="…">`) — a short human label, not a second
description. A few words: `Tide line, first light`. Leave it off and nothing is
lost. It must not be an empty string if the key is present.

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
    alt: A dark tide line curving across pale wet sand at dawn. # required
    title: Tide line, first light # optional — link tooltip
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

| Field         | Required | Type              | Notes                                                                                        |
| :------------ | :------: | :---------------- | :------------------------------------------------------------------------------------------- |
| `title`       |   yes    | string            | Headings and nav.                                                                            |
| `description` |   yes    | string            | 1–2 sentences; reused as the meta description.                                               |
| `date`        |   yes    | `YYYY-MM-DD`      | Capture date.                                                                                |
| `cover`       |   yes    | image path        | Relative to the markdown file.                                                               |
| `photos`      |   yes    | list              | `{ src, alt, title? }` each; array order is display order; `alt` required, `title` optional. |
| `location`    |    no    | string            | Shown on the detail page when set.                                                           |
| `tags`        |    no    | list of strings   | Shown on the detail page when non-empty.                                                     |
| `featured`    |    no    | boolean (`false`) | `true` → also appears on the home page.                                                      |
| `draft`       |    no    | boolean (`false`) | `true` → hidden from the built site, visible in `pnpm dev`.                                  |
| `order`       |    no    | integer (`0`)     | Ascending sort key; ties break by `date`, newest first.                                      |
| `slug`        |    no    | string            | URL slug; defaults to the file name.                                                         |

### Drafts

Set `draft: true` to work on a gallery in the open without publishing it. A
draft renders in `pnpm dev` so you can preview it, but is excluded from the
production build entirely — no home-page card, no detail page. Flip it to
`false` (or delete the line) in the commit that publishes.

### Sorting

Both listings sort the same way: `order` ascending, then `date` newest-first for
ties. New galleries with no `order` get `0` and sort purely by date. Use `order`
only when you want to pin something out of date sequence.

Reordering, unpublishing, and removing a live gallery each have a step-by-step
in [Curating the home page](#curating-the-home-page-reorder-unpublish-remove)
below.

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

## Editing a gallery's photos

- **Reorder photos** — reorder the `photos:` list and renumber the files to
  match.
- **Swap a photo** — drop the new file in, update its `src`/`alt`, keep the
  numbering consistent, delete the old file.

## Curating the home page: reorder, unpublish, remove

Everything below is a **frontmatter edit** (or a file deletion) — no code
changes, no route to touch. The home page and every detail page read one sorted
collection through `src/lib/galleries.ts`
([`getGalleries`](../src/lib/galleries.ts)), so a change moves a gallery
everywhere at once and takes effect on the **next deploy**. Commit it as `fix`
so the pipeline cuts a release and redeploys ([Which commit
type?](#which-commit-type) below); `feat` is only for new content.

### Reorder galleries

The listing sorts by **`order` ascending, then `date` newest-first for ties**
(`byDisplayOrder` in `src/lib/galleries.ts`).

- Every gallery without an explicit `order` gets `0`, so by default the whole
  site is in date order, newest first. Leave `order` off and you never think
  about it.
- A **lower number lists earlier**, ahead of date. `0` (the default) is the
  lowest in normal use, so any gallery still on the default sorts **above** one
  you have given `order: 1`.
- `order` is a sort key, not a slot number: gaps are fine, and it need not run
  `1, 2, 3…`.

Because a defaulted gallery sits at `0`, the reliable move is to **set an
explicit `order` on every gallery whose position you care about**, top to
bottom. Spacing the values (`10, 20, 30`) leaves room to slot one in later
without renumbering the rest.

Worked example — three galleries, default date order:

```
autumn-fell   2026-10-01     harbour   2025-11-30     coastal   2026-02-14
   (newest, lists first)                            (lists last)
```

To force the order `harbour → coastal → autumn-fell`:

```yaml
# harbour.md       →  order: 10
# coastal.md       →  order: 20
# autumn-fell.md   →  order: 30
```

Leaving `autumn-fell` on the default `0` would put it **first**, not last —
that's the one trap. Give every gallery in the sequence a number.

### Unpublish a gallery (keep the files)

Set `draft: true` in its frontmatter and push.

- It **drops off the live site on the next deploy** — no home-page card, no
  `/galleries/<slug>/` page (the route stops being generated).
- It stays **fully previewable in `pnpm dev`**, drafts and all, so you can keep
  working on it.
- Its markdown and images stay in the repo untouched. Re-publish by deleting the
  `draft: true` line (or setting it `false`) and pushing again.

This is the reversible option. Use it for seasonal work, a gallery you are
revising, or anything you might bring back.

### Remove a gallery permanently

Delete both paths:

```sh
rm src/content/galleries/<slug>.md
rm -r src/assets/galleries/<slug>/
```

Nothing else references the gallery — no index, no registry. Build, run the
hooks, commit, push:

```
fix(content): remove <slug> gallery (#NN)
```

The source files are gone from `HEAD` but remain in git history; the deployed
site drops the gallery on the next deploy. The URL `/galleries/<slug>/` will
404 — only do this for a gallery you are sure is not linked from anywhere
external.

### Rename a gallery

You can't, cleanly: the slug is the permanent URL. Renaming is really _remove
the old gallery, add a new one_ — do both steps above, and accept that the old
URL 404s.

### Which commit type?

| Change                         | Type             | Cuts a release / deploy?    |
| :----------------------------- | :--------------- | :-------------------------- |
| New gallery                    | `feat`           | yes (minor)                 |
| Reorder, unpublish, re-publish | `fix`            | yes (patch)                 |
| Remove a gallery               | `fix`            | yes (patch)                 |
| Pure copy-edit / typo fix      | `fix` or `chore` | `chore` does **not** deploy |

If a curation change must reach production, do **not** use `chore` — the
pipeline only deploys after a release, and `chore` cuts none. See
[Deploy pipeline](../CLAUDE.md#deploy-pipeline).

[#22]: https://github.com/abelazo/abelazo.photography-web/issues/22
