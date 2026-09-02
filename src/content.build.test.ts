import { execFileSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, expect, it } from 'vitest';

/**
 * Deploy-gate guarantee (issue #31).
 *
 * `content.config.test.ts` proves the Zod schema *rules* in isolation; this
 * proves the rule is actually wired into `astro build` — a broken gallery
 * makes the build exit non-zero, so bad content can never reach production.
 *
 * The fixture is written to the real collection directory for the length of one
 * `astro build`, then removed. `alt` is the only thing wrong with it: `cover`
 * and `src` point at committed assets, so a non-zero exit can only be the
 * missing-alt rule firing.
 */
const FIXTURE = join(process.cwd(), 'src/content/galleries/__build-gate-broken.md');

const BROKEN_GALLERY = `---
title: Build Gate Fixture
description: Temporary broken gallery — asserts the schema fails the build.
date: 2026-01-01
cover: ../../assets/galleries/coastal-mornings/01-tide-line.jpg
photos:
  - src: ../../assets/galleries/coastal-mornings/01-tide-line.jpg
---

Fixture for content.build.test.ts. Never committed — the test deletes it.
`;

afterEach(() => {
  rmSync(FIXTURE, { force: true });
});

it('astro build exits non-zero on a gallery photo missing alt text', () => {
  writeFileSync(FIXTURE, BROKEN_GALLERY);

  let exitCode = 0;
  let output = '';
  try {
    execFileSync('pnpm', ['exec', 'astro', 'build'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe',
    });
  } catch (err) {
    const e = err as { status?: number; stdout?: string; stderr?: string };
    exitCode = e.status ?? 1;
    output = `${e.stdout ?? ''}${e.stderr ?? ''}`;
  }

  expect(exitCode).not.toBe(0);
  expect(output).toMatch(/alt/i);
  expect(output).toMatch(/__build-gate-broken/);
}, 120_000);
