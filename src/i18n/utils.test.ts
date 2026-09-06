import { describe, expect, it } from 'vitest';
import { getLangFromPath, getLangFromUrl, stripLocale, localizePath, t } from './utils';
import { locales } from './ui';

describe('getLangFromPath', () => {
  it('reads Spanish (default, unprefixed)', () => {
    expect(getLangFromPath('/')).toBe('es');
    expect(getLangFromPath('/contact')).toBe('es');
    expect(getLangFromPath('/galleries/moda')).toBe('es');
  });

  it('reads English from the /en prefix', () => {
    expect(getLangFromPath('/en')).toBe('en');
    expect(getLangFromPath('/en/')).toBe('en');
    expect(getLangFromPath('/en/galleries/moda')).toBe('en');
  });

  it('does not treat a slug that merely starts with "en" as English', () => {
    expect(getLangFromPath('/enterprise')).toBe('es');
  });

  it('accepts a URL instance', () => {
    expect(getLangFromUrl(new URL('https://abelazo.photography/en/contact'))).toBe('en');
  });
});

describe('stripLocale', () => {
  it('leaves an unprefixed path untouched', () => {
    expect(stripLocale('/contact')).toBe('/contact');
  });

  it('removes the /en prefix and keeps a leading slash', () => {
    expect(stripLocale('/en/galleries/moda')).toBe('/galleries/moda');
    expect(stripLocale('/en')).toBe('/');
    expect(stripLocale('/en/')).toBe('/');
  });
});

describe('localizePath', () => {
  it('maps a Spanish path to its English sibling', () => {
    expect(localizePath('/galleries/moda', 'en')).toBe('/en/galleries/moda');
    expect(localizePath('/', 'en')).toBe('/en');
  });

  it('maps an English path back to Spanish', () => {
    expect(localizePath('/en/galleries/moda', 'es')).toBe('/galleries/moda');
    expect(localizePath('/en', 'es')).toBe('/');
  });

  it('is idempotent for the same locale', () => {
    expect(localizePath('/contact', 'es')).toBe('/contact');
    expect(localizePath('/en/contact', 'en')).toBe('/en/contact');
  });
});

describe('t', () => {
  it('returns the requested locale tree', () => {
    expect(t('es').nav.contact).toBe('Contacto');
    expect(t('en').nav.contact).toBe('Contact');
  });

  it('exposes the shared motto in both locales', () => {
    expect(t('es').home.hero.motto).toMatch(/fotografías profesionales/);
    expect(t('en').home.hero.motto).toMatch(/professional photographs/);
  });
});

describe('copy trees', () => {
  // `en` is `satisfies UiTree` at compile time, but that does not catch a
  // diverging array length (e.g. a `body` paragraph added to one locale only).
  const shape = (v: unknown): unknown =>
    Array.isArray(v)
      ? v.map(shape)
      : v && typeof v === 'object'
        ? Object.fromEntries(
            Object.entries(v)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, val]) => [k, shape(val)]),
          )
        : typeof v;

  it('every locale has structurally identical copy', () => {
    const reference = shape(t(locales[0]));
    for (const lang of locales.slice(1)) {
      expect(shape(t(lang)), `locale "${lang}" diverges from "${locales[0]}"`).toEqual(reference);
    }
  });
});
