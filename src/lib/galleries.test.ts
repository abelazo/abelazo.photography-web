import { describe, expect, it } from 'vitest';
import { byDisplayOrder, isListed, type Gallery } from './galleries';

// Minimal stand-in: only the frontmatter fields the ordering/visibility rules
// read. `order` and `draft` carry the schema defaults so a test states just the
// field it exercises.
const gallery = (data: Partial<Gallery['data']>): Gallery =>
  ({
    data: { order: 0, draft: false, date: new Date('2026-01-01'), ...data },
  }) as Gallery;

describe('byDisplayOrder', () => {
  it('sorts by `order` ascending', () => {
    const sorted = [gallery({ order: 2 }), gallery({ order: 0 }), gallery({ order: 1 })].sort(
      byDisplayOrder,
    );
    expect(sorted.map((g) => g.data.order)).toEqual([0, 1, 2]);
  });

  it('breaks an `order` tie by date, newest first', () => {
    const older = gallery({ order: 1, date: new Date('2026-01-01') });
    const newer = gallery({ order: 1, date: new Date('2026-06-01') });
    expect([older, newer].sort(byDisplayOrder)).toEqual([newer, older]);
  });

  it('lets `order` override date — a lower `order` pins earlier even when older', () => {
    const pinned = gallery({ order: 0, date: new Date('2020-01-01') });
    const fresher = gallery({ order: 5, date: new Date('2026-01-01') });
    expect([fresher, pinned].sort(byDisplayOrder)).toEqual([pinned, fresher]);
  });
});

describe('isListed', () => {
  it('lists a published gallery in every environment', () => {
    expect(isListed(gallery({ draft: false }), false)).toBe(true);
    expect(isListed(gallery({ draft: false }), true)).toBe(true);
  });

  it('hides a draft from the production build but keeps it in dev', () => {
    expect(isListed(gallery({ draft: true }), false)).toBe(false);
    expect(isListed(gallery({ draft: true }), true)).toBe(true);
  });
});
