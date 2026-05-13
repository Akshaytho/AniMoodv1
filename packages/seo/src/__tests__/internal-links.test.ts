import { describe, it, expect } from 'vitest';
import { enforceLinkBudget, validateAnchorText } from '../internal-links/index';

describe('enforceLinkBudget', () => {
  it('passes a well-linked page', () => {
    const r = enforceLinkBudget([
      { kind: 'emotion', slug: 'loneliness', anchor: 'Loneliness', url: 'x' },
      { kind: 'emotion', slug: 'healing', anchor: 'Healing', url: 'x' },
      { kind: 'anime', slug: 'vinland-saga', anchor: 'Vinland Saga', url: 'x' },
      { kind: 'manga', slug: 'vagabond', anchor: 'Vagabond', url: 'x' },
      { kind: 'manhwa', slug: 'omniscient-reader', anchor: 'Omniscient Reader', url: 'x' },
      { kind: 'life-stage', slug: 'burnout', anchor: 'Burnout', url: 'x' },
      { kind: 'character', slug: 'thorfinn', anchor: 'Thorfinn', url: 'x' },
      { kind: 'external', anchor: 'Official MAL listing', url: 'https://mal.net/x' },
      { kind: 'external', anchor: 'Official AniList listing', url: 'https://anilist.co/x' },
    ]);
    expect(r.ok).toBe(true);
    expect(r.totalInternal).toBe(7);
    expect(r.totalExternal).toBe(2);
  });

  it('flags missing emotion links (only 1 of required 2)', () => {
    const r = enforceLinkBudget([
      { kind: 'emotion', slug: 'a', anchor: 'A', url: 'x' },
      { kind: 'anime', slug: 'b', anchor: 'B', url: 'x' },
      { kind: 'manga', slug: 'c', anchor: 'C', url: 'x' },
      { kind: 'manhwa', slug: 'cc', anchor: 'CC', url: 'x' },
      { kind: 'life-stage', slug: 'd', anchor: 'D', url: 'x' },
      { kind: 'character', slug: 'e', anchor: 'E', url: 'x' },
      { kind: 'external', anchor: 'X', url: 'https://x' },
      { kind: 'external', anchor: 'Y', url: 'https://y' },
    ]);
    expect(r.ok).toBe(false);
    expect(r.missing.some((m) => m.label === 'emotion links' && m.have === 1)).toBe(true);
  });

  it('flags fewer than 5 internal links', () => {
    const r = enforceLinkBudget([
      { kind: 'emotion', slug: 'a', anchor: 'A', url: 'x' },
      { kind: 'emotion', slug: 'b', anchor: 'B', url: 'x' },
      { kind: 'life-stage', slug: 'c', anchor: 'C', url: 'x' },
      { kind: 'external', anchor: 'X', url: 'https://x' },
      { kind: 'external', anchor: 'Y', url: 'https://y' },
    ]);
    expect(r.ok).toBe(false);
    expect(r.missing.some((m) => m.label === 'internal links total' && m.needed === 5)).toBe(true);
  });
});

describe('validateAnchorText', () => {
  it.each([
    ['Loneliness', true],
    ['Vinland Saga', true],
    ['click here', false],
    ['this', false],
    ['HERE', false],
    ['x', false],
  ])('validateAnchorText(%s) ok=%s', (anchor, ok) => {
    expect(validateAnchorText(anchor).ok).toBe(ok);
  });
});
