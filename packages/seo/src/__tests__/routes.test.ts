import { describe, it, expect } from 'vitest';
import { toEntityUrl, isValidSlug, normalizeBaseUrl, ALL_ENTITY_KINDS } from '../sitemap/routes';

describe('isValidSlug', () => {
  it.each([
    ['vinland-saga', true],
    ['march-comes-in-like-a-lion', true],
    ['x', true],
    ['Vinland-Saga', false],
    ['vinland--saga', false],
    ['-leading', false],
    ['trailing-', false],
    ['with spaces', false],
    ['', false],
  ])('isValidSlug(%s) → %s', (slug, ok) => {
    expect(isValidSlug(slug)).toBe(ok);
  });
});

describe('normalizeBaseUrl', () => {
  it('strips trailing slashes', () => {
    expect(normalizeBaseUrl('https://animood.app/')).toBe('https://animood.app');
    expect(normalizeBaseUrl('https://animood.app///')).toBe('https://animood.app');
  });
});

describe('toEntityUrl', () => {
  it('builds canonical URLs', () => {
    expect(toEntityUrl({ kind: 'anime', slug: 'vinland-saga', baseUrl: 'https://animood.app' }))
      .toBe('https://animood.app/anime/vinland-saga');
    expect(toEntityUrl({ kind: 'life-stage', slug: 'burnout-recovery', baseUrl: 'https://animood.app/' }))
      .toBe('https://animood.app/life-stage/burnout-recovery');
  });

  it('throws on invalid slug', () => {
    expect(() => toEntityUrl({ kind: 'anime', slug: 'BAD SLUG', baseUrl: 'x' })).toThrow();
  });

  it('covers every EntityKind', () => {
    for (const k of ALL_ENTITY_KINDS) {
      expect(toEntityUrl({ kind: k, slug: 'x', baseUrl: 'https://a.b' })).toMatch(/^https:\/\/a\.b\//);
    }
  });
});
