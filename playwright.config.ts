import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config. Chromium only (see issue #41 / CONTRIBUTING).
 *
 * Two servers, two projects:
 *  - `chromium` runs every spec against the Astro **dev** server, which
 *    Playwright starts for you — or reuses if you already have `pnpm dev`
 *    running locally.
 *  - `chromium-prod` runs the build-only specs (sitemap / robots, issue #26)
 *    against `astro preview` on a **production build**. `@astrojs/sitemap` is
 *    an `astro:build:done` integration — it emits nothing under `astro dev` —
 *    so those artefacts can only be asserted against a real build.
 */
const PORT = 4321;
const PROD_PORT = 4322;
const baseURL = `http://localhost:${PORT}`;
const prodBaseURL = `http://localhost:${PROD_PORT}`;

/** Specs that need a production build (served by `astro preview`). */
const PROD_SPECS = /sitemap-robots\.spec\.ts/;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: PROD_SPECS,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-prod',
      testMatch: PROD_SPECS,
      use: { ...devices['Desktop Chrome'], baseURL: prodBaseURL },
    },
  ],
  webServer: [
    {
      command: 'pnpm dev',
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      // Astro auto-daemonises `astro dev` when it detects an AI-agent shell,
      // which makes the process exit immediately and Playwright think the
      // server died. This escape hatch keeps it in the foreground so Playwright
      // can own its lifecycle. Harmless outside agent shells (CI, humans) — it
      // only opts out of the auto-detection. If you already have `pnpm dev`
      // running, Playwright reuses it and never runs this command.
      env: { ASTRO_DEV_BACKGROUND: '1' },
    },
    {
      // Build then serve the static output. CI already runs `pnpm build` before
      // the E2E job, but building here too keeps the suite self-contained
      // locally; the build cache makes the second run cheap.
      command: `pnpm build && pnpm exec astro preview --port ${PROD_PORT}`,
      url: prodBaseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      // Same agent-shell auto-daemonise escape hatch as the dev server above —
      // `astro preview` daemonises too. Keep it in the foreground so Playwright
      // owns its lifecycle.
      env: { ASTRO_DEV_BACKGROUND: '1' },
    },
  ],
});
