import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config. Chromium only (see issue #41 / CONTRIBUTING).
 * Tests run against the Astro dev server, which Playwright starts for you —
 * or reuses if you already have `pnpm dev` running locally.
 */
const PORT = 4321;
const baseURL = `http://localhost:${PORT}`;

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
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    // Astro auto-daemonises `astro dev` when it detects an AI-agent shell, which
    // makes the process exit immediately and Playwright think the server died.
    // This escape hatch keeps it in the foreground so Playwright can own its
    // lifecycle. Harmless outside agent shells (CI, humans) — it only opts out
    // of the auto-detection. If you already have `pnpm dev` running, Playwright
    // reuses it and never runs this command.
    env: { ASTRO_DEV_BACKGROUND: '1' },
  },
});
