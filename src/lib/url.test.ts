import { describe, expect, it } from 'vitest';
import { absoluteUrl } from './url';

describe('absoluteUrl', () => {
  it('joins base and path with a single slash', () => {
    expect(absoluteUrl('https://abelazo.photography', 'about')).toBe(
      'https://abelazo.photography/about',
    );
  });

  it('collapses duplicate slashes at the join', () => {
    expect(absoluteUrl('https://abelazo.photography/', '/about')).toBe(
      'https://abelazo.photography/about',
    );
  });

  it('accepts a URL instance as base', () => {
    expect(absoluteUrl(new URL('https://abelazo.photography'), 'gallery/2026')).toBe(
      'https://abelazo.photography/gallery/2026',
    );
  });

  it('returns the bare origin for an empty path', () => {
    expect(absoluteUrl('https://abelazo.photography/', '')).toBe('https://abelazo.photography');
  });
});
