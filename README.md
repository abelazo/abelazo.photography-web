# abelazo.photography

Personal photography website. Built with [Astro](https://astro.build/) and deployed on Netlify.

## Requirements

- Node `24.20.0` (see `.nvmrc` — matches the Netlify build image). With `nvm`: `nvm use`.
- pnpm `11` (declared in `package.json` → `packageManager`). Enable via Corepack: `corepack enable pnpm`.
- [`uv`](https://docs.astral.sh/uv/) — the commit-message hook runs Commitizen via `uvx`.

## Setup

```sh
nvm use
corepack enable pnpm
pnpm install
prek install   # or: pre-commit install — wires the git hooks
```

## Commands

All commands run from the project root:

| Command             | Action                                                      |
| :------------------ | :---------------------------------------------------------- |
| `pnpm dev`          | Start the dev server at `http://localhost:4321`             |
| `pnpm build`        | Type-check (`astro check`) then build the site to `./dist/` |
| `pnpm preview`      | Serve the production build locally                          |
| `pnpm test`         | Run the unit test suite once (Vitest)                       |
| `pnpm test:watch`   | Run Vitest in watch mode                                    |
| `pnpm check`        | Type-check `.astro` and TypeScript files                    |
| `pnpm lint`         | Lint with ESLint                                            |
| `pnpm format`       | Format the codebase with Prettier                           |
| `pnpm format:check` | Verify formatting without writing changes                   |
| `pnpm commit`       | Commit through the interactive Commitizen prompt            |

## Commit convention

Commit messages are enforced by [Commitizen](https://commitizen-tools.github.io/commitizen/)
(`cz_customize` ruleset in `.cz.toml`) through a `commit-msg` git hook.

```
<type>(<scope>): <subject> (#<issue>)

feat(authorizer): add DNI normalization (#12)
```

- **type** — `build` `bump` `chore` `ci` `docs` `feat` `fix` `perf` `refactor` `revert` `style` `test`
- **scope** — optional, e.g. `(authorizer)`
- **`!`** — optional, before the colon, marks a breaking change
- **subject** — imperative; must end with the issue/PR reference ` (#<number>)`
- **body** — optional; separated from the subject by one blank line

Run `pnpm commit` for a guided prompt, or write the message yourself — the hook
rejects anything that fails `.cz.toml` → `schema_pattern`.

## Project structure

```text
/
├── public/          static assets served as-is
├── src/
│   ├── assets/galleries/<slug>/   gallery source images (optimised at build)
│   ├── content/galleries/         one markdown file per gallery
│   ├── content.config.ts          gallery collection + Zod schema
│   ├── lib/         framework-agnostic helpers (unit tested)
│   └── pages/       file-based routes
├── astro.config.mjs
├── eslint.config.js
├── vitest.config.ts
├── pnpm-workspace.yaml   pnpm settings (build-script allowlist)
├── .cz.toml              Commitizen (cz_customize) commit-message rules
├── .pre-commit-config.yaml  commit-msg hook that runs `cz check`
└── tsconfig.json        extends astro/tsconfigs/strict
```

## Content

Galleries are an [Astro content collection](https://docs.astro.build/en/guides/content-collections/)
loaded from `src/content/galleries/`. Each gallery is one markdown file; its
frontmatter is validated against the Zod schema in `src/content.config.ts`, so a
missing or mis-typed field fails `pnpm build` with a pointed error.

```
src/content/galleries/coastal-mornings.md   # frontmatter + optional prose body
src/assets/galleries/coastal-mornings/      # the image files it references
```

| Field         | Type              | Notes                                                                      |
| :------------ | :---------------- | :------------------------------------------------------------------------- |
| `title`       | string            | Shown in headings and nav.                                                 |
| `slug`        | string (optional) | URL slug; defaults to the file name.                                       |
| `description` | string            | One or two sentences; reused for meta descriptions.                        |
| `date`        | `YYYY-MM-DD`      | Capture date.                                                              |
| `cover`       | image path        | Relative to the markdown file.                                             |
| `featured`    | boolean           | Defaults to `false`. Surfaces the gallery on the home page.                |
| `order`       | integer           | Manual sort key, ascending. Defaults to `0`.                               |
| `photos`      | list              | `{ src, alt }` per photo; array order is display order. `alt` is required. |

Query galleries through the helpers in `src/lib/galleries.ts`
(`getGalleries`, `getFeaturedGalleries`, `gallerySlug`) so sorting stays
consistent. `coastal-mornings` and `harbour-lights` are sample galleries — a
working reference to copy and then replace.

Folder layout, slug and file-naming rules, image requirements (format,
resolution, cover selection, alt text), and a start-to-finish **Adding a new
gallery** checklist live in [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md).

## Tooling

- **Package manager** — pnpm, pinned via `packageManager`. `esbuild` and `sharp` are allowlisted to run their build scripts in `pnpm-workspace.yaml`.
- **Images** — `sharp` powers `astro:assets` optimisation of gallery photos at build time.
- **TypeScript** — strict mode via `astro/tsconfigs/strict`.
- **ESLint** — flat config: `typescript-eslint` + `eslint-plugin-astro`, with `eslint-config-prettier` disabling stylistic rules.
- **Prettier** — `prettier-plugin-astro` for `.astro` formatting.
- **Vitest** — configured through `astro/config`'s `getViteConfig`; tests live next to source as `*.test.ts`.
- **Commitizen** — `cz_customize` ruleset (`.cz.toml`); the `commit-msg` hook in `.pre-commit-config.yaml` runs `cz check` via `uvx`. Wire hooks with `prek install`.

## Deployment

Netlify builds with `pnpm build` and publishes `dist/`. It detects pnpm from `pnpm-lock.yaml`; Node version is pinned by `.nvmrc`.
