import { describe, it, expect } from 'vitest';
import { buildTVSeries, buildCreativeWorkSeries, buildPerson, buildThing, buildBreadcrumbList, buildWebSite } from '../jsonld/index';

const BASE = 'https://animood.app';

describe('buildTVSeries', () => {
  it('produces the spec §11.1 example shape for Vinland Saga', () => {
    const j = buildTVSeries({
      baseUrl: BASE,
      slug: 'vinland-saga',
      name: 'Vinland Saga',
      nameOriginal: 'ヴィンランド・サガ',
      description: 'Revenge collapses into the search for a life worth living.',
      genre: ['Seinen', 'Historical', 'Drama'],
      datePublished: '2019-07-08',
      characters: [{ kind: 'character', slug: 'thorfinn', name: 'Thorfinn' }],
      relatedTitles: [{ kind: 'manga', slug: 'vagabond', name: 'Vagabond' }],
      themes: [{ kind: 'theme', slug: 'redemption', name: 'Redemption' }],
    });
    expect(j['@type']).toBe('TVSeries');
    expect(j['name']).toBe('Vinland Saga');
    expect(j['url']).toBe('https://animood.app/anime/vinland-saga');
    expect(j['alternateName']).toBe('ヴィンランド・サガ');
    expect(j['genre']).toEqual(['Seinen', 'Historical', 'Drama']);
    expect(j['character']).toEqual([
      { '@type': 'Person', name: 'Thorfinn', url: 'https://animood.app/character/thorfinn' },
    ]);
    expect(j['isRelatedTo']).toEqual([
      { '@type': 'CreativeWorkSeries', name: 'Vagabond', url: 'https://animood.app/manga/vagabond' },
    ]);
    expect(j['about']).toEqual([
      { '@type': 'Thing', name: 'Redemption', url: 'https://animood.app/theme/redemption' },
    ]);
  });

  it('omits optional fields when absent', () => {
    const j = buildTVSeries({
      baseUrl: BASE,
      slug: 'x',
      name: 'X',
      description: 'desc',
      characters: [],
    });
    expect(j['alternateName']).toBeUndefined();
    expect(j['character']).toBeUndefined();
    expect(j['isRelatedTo']).toBeUndefined();
  });
});

describe('buildCreativeWorkSeries', () => {
  it('emits @type CreativeWorkSeries for manhwa', () => {
    const j = buildCreativeWorkSeries({
      baseUrl: BASE,
      kind: 'manhwa',
      slug: 'omniscient-reader',
      name: 'Omniscient Reader',
      description: 'desc',
      characters: [],
    });
    expect(j['@type']).toBe('CreativeWorkSeries');
    expect(j['url']).toBe('https://animood.app/manhwa/omniscient-reader');
  });
});

describe('buildPerson', () => {
  it('builds character JSON-LD with subjectOf', () => {
    const j = buildPerson({
      baseUrl: BASE,
      slug: 'thorfinn',
      name: 'Thorfinn',
      description: 'desc',
      appearsIn: [{ kind: 'anime', slug: 'vinland-saga', name: 'Vinland Saga' }],
    });
    expect(j['@type']).toBe('Person');
    expect(j['subjectOf']).toEqual([
      { '@type': 'TVSeries', name: 'Vinland Saga', url: 'https://animood.app/anime/vinland-saga' },
    ]);
  });
});

describe('buildThing', () => {
  it('builds emotion page Thing', () => {
    const j = buildThing({
      baseUrl: BASE,
      kind: 'emotion',
      slug: 'loneliness',
      name: 'Loneliness',
      description: 'Feeling fundamentally alone or unseen by others, even in a crowd.',
    });
    expect(j['@type']).toBe('Thing');
    expect(j['url']).toBe('https://animood.app/emotion/loneliness');
  });
});

describe('buildBreadcrumbList', () => {
  it('numbers items from 1', () => {
    const j = buildBreadcrumbList([
      { name: 'Home', url: BASE },
      { name: 'Anime', url: `${BASE}/anime` },
      { name: 'Vinland Saga', url: `${BASE}/anime/vinland-saga` },
    ]);
    const items = j['itemListElement'] as unknown as Array<{ position: number; name: string }>;
    expect(items[0]!.position).toBe(1);
    expect(items[2]!.name).toBe('Vinland Saga');
  });

  it('throws on empty crumbs', () => {
    expect(() => buildBreadcrumbList([])).toThrow();
  });
});

describe('buildWebSite', () => {
  it('includes potentialAction when searchUrlTemplate given', () => {
    const j = buildWebSite({
      baseUrl: BASE,
      name: 'AniMood',
      description: 'Emotional discovery for anime/manga/manhwa.',
      searchUrlTemplate: `${BASE}/search?q={search_term_string}`,
    });
    expect(j['@type']).toBe('WebSite');
    expect(j['potentialAction']).toBeDefined();
  });
});
