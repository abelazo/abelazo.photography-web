## What this site is

The site for **Abelazo Photography** — a natural-light photo studio in Tres
Cantos (Madrid). It exists to get visitors to book a session (personal,
professional, fashion, editorial) and is aimed at people who have **never posed
before**. Tagline: _"Todo el mundo se merece tener fotografías profesionales"_.
Booking is by email only for now (`contactEmail` in `src/i18n/ui.ts`).

The home page (`src/pages/index.astro` → `src/components/StudioLanding.astro`) is
a short intro (the two key messages) plus a taster of the galleries — nothing
else. The full galleries list is its own page, **`/galleries`**
(`src/pages/galleries/index.astro` → `src/components/GalleryIndex.astro`); the
per-gallery pages sit under it at `/galleries/<slug>`. The detail of what a
session is (who it is for, what it includes, the four types, the session day)
lives on **`/the-session`** (`src/pages/the-session.astro` →
`src/components/SessionInfo.astro`). There is no "el estudio" page. Every
"Reserva tu sesión" CTA links to `/contact`. Nav: **La sesión · Galerías ·
Contacto** (visitor-facing labels are translated; the URLs are not — see below).

## Internationalization (ES / EN)

- **URL path segments are always English, in both locales** — never Spanish, never
  translated. The visitor-facing nav/label copy is localized; the routes are not.
  Pages: `/the-session`, `/contact`, `/galleries`, `/galleries/<slug>`. When
  adding a page, name the file with an English segment and mirror it under
  `src/pages/en/` with the same segment.
- Spanish is the default locale and has **no URL prefix** (`/`, `/the-session`,
  `/contact`, `/galleries/<slug>`). English lives under **`/en/`** (`/en/`,
  `/en/the-session`, `/en/contact`, `/en/galleries/<slug>`) — same path segments,
  just prefixed. Config: the `i18n` block in `astro.config.mjs`
  (`prefixDefaultLocale: false`).
- **All UI copy** lives in `src/i18n/ui.ts`, one tree per locale. Components read
  `t(lang)` from `src/i18n/utils.ts` — never hardcode visitor-facing strings.
  Every key in `es` must also exist in `en`.
- **Keep locales in sync.** Whenever text is added or edited in one locale's
  tree (`es` or `en`) in `src/i18n/ui.ts`, update the other locale's
  corresponding text in the same change — as a translation, not a copy-paste.
  This applies to any visitor-facing copy, not just `src/i18n/ui.ts`: gallery
  frontmatter (`description`, and the optional `i18n.en` override) and any
  other bilingual content follow the same rule.
- Locale helpers in `src/i18n/utils.ts`: `getLangFromUrl`, `stripLocale`,
  `localizePath` (unit-tested in `utils.test.ts`).
- Each page has an ES file under `src/pages/` and an EN mirror under
  `src/pages/en/`; both render the same component with a different `lang` prop
  (`StudioLanding`, `GalleryIndex`, `SessionInfo`, `ContactPanel`,
  `GalleryDetail`).
- The language switcher (in `SiteHeader.astro`) stores a `lang` cookie; an inline
  script in `BaseLayout.astro` applies that preference once per tab on load.
- Gallery `title`/`description` are Spanish; add an optional `i18n.en` block in
  the frontmatter for the English pages (`localizedGallery` in
  `src/lib/galleries.ts` handles the fallback).

## Environment

- Node `24.20.0`, pinned in `.nvmrc` (matches the Netlify build image). Run `nvm use`.
- **pnpm** (pinned via `packageManager` in `package.json`). Never run `npm` or `yarn` here — it would create a competing lockfile.

```
nvm use
corepack enable pnpm   # first time only
pnpm install
```

Build-script permissions for dependencies live in `pnpm-workspace.yaml` (`allowBuilds`).

## Commands

| Command             | Action                                     |
| :------------------ | :----------------------------------------- |
| `pnpm dev`          | Dev server at http://localhost:4321        |
| `pnpm build`        | `astro check` then `astro build` → `dist/` |
| `pnpm preview`      | Serve the production build                 |
| `pnpm test`         | Vitest, single run                         |
| `pnpm test:watch`   | Vitest watch mode                          |
| `pnpm test:e2e`     | Playwright E2E suite (Chromium)            |
| `pnpm check`        | Type-check `.astro` + TS                   |
| `pnpm lint`         | ESLint                                     |
| `pnpm format`       | Prettier write                             |
| `pnpm format:check` | Prettier check (CI-safe)                   |
| `pnpm commit`       | Interactive Commitizen prompt              |

Run `pnpm lint`, `pnpm format:check`, and `pnpm test` before proposing changes.

## Workflow

- **Trunk-based development.** Work directly on `main` — do not create branches
  or open pull requests.
- **Every User Story ships with E2E tests.** When implementing a GitHub issue
  that is a user story, add or extend a Playwright spec in `e2e/` that asserts
  each of its acceptance criteria from the visitor's point of view. One spec per
  story (e.g. `e2e/<feature>.spec.ts`), criteria mapped to `test()` cases. The
  story is not done until `pnpm test:e2e` covers it and passes.
  _Exception:_ infrastructure stories (CI/CD, tooling) with no visitor-facing
  behaviour are verified by the pipeline running green and a live deploy, not by
  a Playwright spec.
- **Always run the pre-commit hooks** before handing work back:
  `prek run --all-files` (or `pre-commit run --all-files`). Fix anything they
  flag.
- **Do not commit.** Leave the changes in the working tree; the owner reviews and
  commits manually after verification.

## Commit messages

Enforced by Commitizen (`cz_customize`, config in `.cz.toml`) via a `commit-msg`
hook (`.pre-commit-config.yaml`, run by `prek`/`pre-commit`).

```
<type>(<scope>): <subject> (#<issue>)

feat(authorizer): add DNI normalization (#12)
```

- **type** — one of: `build bump chore ci docs feat fix perf refactor revert style test`
- **scope** — optional, in parens
- **`!`** — optional, before the colon, marks a breaking change
- **subject** — imperative; MUST end with the issue/PR ref ` (#<number>)`
- **body** — optional; one blank line after the subject

Commit with `pnpm commit` (interactive) or write the message by hand — the hook
rejects anything that does not match
`.cz.toml` → `schema_pattern`.

Setup on a fresh clone: `uv` must be installed (the hook runs
`uvx --from commitizen cz check`), then `prek install` (or `pre-commit install`)
to wire the git hooks.

## Dev server

`pnpm dev` runs in background mode. Manage it with `pnpm exec astro dev stop`, `astro dev status`, and `astro dev logs`.

## E2E tests (Playwright)

- Config: `playwright.config.ts`. Specs: `e2e/*.spec.ts`. All three engines —
  Chromium, Firefox, WebKit (issue #32).
- One-time per machine: `pnpm exec playwright install chromium firefox webkit`.
- Run: `pnpm test:e2e`. Playwright starts the dev server itself (foreground,
  via `ASTRO_DEV_BACKGROUND=1` in the config) or reuses one already running on
  `:4321`.
- Six projects: `chromium` / `firefox` / `webkit` run every spec against
  `astro dev` (`:4321`); `<engine>-prod` run the build-only specs
  (`sitemap-robots.spec.ts`) against `astro preview` on a real production build
  (`:4322`, `pnpm build` first). Build-only integrations like `@astrojs/sitemap`
  emit nothing under `astro dev`.
- Firefox skips the `zoom (mobile)` block — Playwright's Firefox rejects
  `isMobile` device emulation.
- `pnpm test:e2e:ui` for the interactive runner, `pnpm test:e2e:report` for the
  last HTML report. Reports/artifacts land in `playwright-report/` and
  `test-results/` (git-ignored).
- CI runs `pnpm test:e2e` in the `verify` job of `.github/workflows/deploy.yml`
  (see **Deploy pipeline**).
- New user stories require coverage here — see **Workflow**.

## Deploy pipeline

`.github/workflows/deploy.yml` runs on every push to `main`:

1. **`verify`** — `pnpm lint`, `format:check`, `test`, `build`, then Playwright
   E2E. Any failure blocks the rest and GitHub emails the owner.
2. **`release`** — [semantic-release](https://github.com/semantic-release/semantic-release)
   (`.releaserc.json`). Reads the Conventional-Commit types since the last tag:
   `feat` → minor, `fix`/`perf` → patch, `!`/`BREAKING CHANGE` → major;
   `chore`/`docs`/`ci`/`style`/`test`/`refactor` → no release. On a release it
   tags `vX.Y.Z`, writes `CHANGELOG.md`, bumps `package.json`, commits both back
   to `main` as `chore(release): … [skip ci]`, and publishes a GitHub Release.
3. **`deploy`** — only when `release` cut a version. Rebuilds at the new tag and
   runs `netlify deploy --prod` (prebuilt `dist/`, no Netlify-side build). Runs
   under the `netlify` GitHub Environment, so every deploy is recorded in the
   repo's Environments / Deployments view with the live URL.

Releases are semantic-release only — `cz` / `.cz.toml` stays commit-message
linting; `cz bump` is unused.

The Netlify site is **not linked to the Git repo** (no Netlify auto-build) —
GitHub Actions is the only path to production. Requires repo secrets
`NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID`, and repo Actions permissions set to
"Read and write" so semantic-release can push.

## Content — adding a gallery

The site's only content type is **photo galleries**. Full rules (naming, image
budget, frontmatter schema, editing/removing) live in
[`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md) — read it before touching
galleries. Short version:

- A gallery is two paths sharing one kebab-case **slug**: a markdown file
  `src/content/galleries/<slug>.md` and an image folder
  `src/assets/galleries/<slug>/`. Nothing else references it — no index or route
  to edit. Both listings (home page, detail page) read the collection at build
  time via `src/lib/galleries.ts`. A published gallery's page is picked up
  automatically by `@astrojs/sitemap` (`sitemap-index.xml` → `sitemap-0.xml`);
  a `draft` gallery has no built page, so it never reaches the sitemap.
  `public/robots.txt` allows all crawling and points at the sitemap.
- Frontmatter is validated by the strict Zod schema in `src/content.config.ts`;
  a missing or mistyped field fails `pnpm build` with a pointed error. Required:
  `title`, `description`, `date` (`YYYY-MM-DD`), `cover` (path relative to the
  md file), `photos` (`{ src, alt, title? }` list, array order = display order,
  `alt` required and non-empty, `title` optional link tooltip). Optional:
  `location`, `tags`, `featured` (home page), `draft`
  (hidden in prod, visible in `pnpm dev`), `order`, `slug`.
- **No manual image resizing or compression.** `astro:assets` (`sharp`)
  generates the served derivatives at build time. Commit one source JPEG per
  photo, sRGB, long edge ~2560 px, ideally under ~1 MB — a git-repo-size budget
  (issue #22), not a schema rule.
- Steps: create folder → add images (`NN-description.jpg`) → copy a sample md
  and write frontmatter → `pnpm dev` preview → `pnpm build` + `pnpm format` →
  `prek run --all-files` → commit `feat(content): add <slug> gallery (#NN)` →
  push. `feat` cuts a release, which triggers the Netlify deploy.
- **Curating** (reorder / unpublish / remove) is frontmatter-only, no code:
  `order` ascending then `date` newest-first drives the listing (defaulted
  galleries sit at `0`, ahead of `order: 1`); `draft: true` pulls a gallery
  from the production build but keeps it in `pnpm dev`; removing = delete both
  paths. Commit as `fix` (not `chore` — `chore` never deploys). Full process:
  CONTRIBUTING "Curating the home page".

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
