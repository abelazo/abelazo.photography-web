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
| `pnpm check`        | Type-check `.astro` + TS                   |
| `pnpm lint`         | ESLint                                     |
| `pnpm format`       | Prettier write                             |
| `pnpm format:check` | Prettier check (CI-safe)                   |
| `pnpm commit`       | Interactive Commitizen prompt              |

Run `pnpm lint`, `pnpm format:check`, and `pnpm test` before proposing changes.

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

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
