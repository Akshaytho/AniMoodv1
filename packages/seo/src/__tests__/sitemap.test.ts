import { describe, it, expect } from 'vitest';
import { buildUrlSet, buildSitemapIndex, MAX_URLS_PER_SET } from '../sitemap/index';

describe('buildUrlSet', () => {
  it('emits well-formed XML with all fields', () => {
    const xml = buildUrlSet([
      {
        loc: 'https://animood.app/anime/vinland-saga',
        lastmod: '2026-05-13T12:00:00Z',
        changefreq: 'weekly',
        priority: 0.8,
      },
    ]);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://animood.app/anime/vinland-saga</loc>');
    expect(xml).toContain('<lastmod>2026-05-13T12:00:00Z</lastmod>');
    expect(xml).toContain('<changefreq>weekly</changefreq>');
    expect(xml).toContain('<priority>0.80</priority>');
  });

  it('escapes ampersands and angle brackets in loc', () => {
    const xml = buildUrlSet([{ loc: 'https://animood.app/q?a=1&b=2' }]);
    expect(xml).toContain('https://animood.app/q?a=1&amp;b=2');
  });

  it('clamps priority to [0, 1]', () => {
    const xml = buildUrlSet([{ loc: 'https://a.b/x', priority: 2.5 }]);
    expect(xml).toContain('<priority>1.00</priority>');
  });

  it('throws over the 50k cap', () => {
    const urls = Array.from({ length: MAX_URLS_PER_SET + 1 }, (_, i) => ({ loc: `https://a.b/${i}` }));
    expect(() => buildUrlSet(urls)).toThrow(/50000/);
  });
});

describe('buildSitemapIndex', () => {
  it('emits a sitemap index referencing children', () => {
    const xml = buildSitemapIndex([
      { loc: 'https://animood.app/sitemaps/emotions.xml', lastmod: '2026-05-13' },
      { loc: 'https://animood.app/sitemaps/titles.xml' },
    ]);
    expect(xml).toContain('<sitemapindex');
    expect(xml).toContain('<sitemap><loc>https://animood.app/sitemaps/emotions.xml</loc><lastmod>2026-05-13</lastmod></sitemap>');
  });

  it('throws on empty children', () => {
    expect(() => buildSitemapIndex([])).toThrow();
  });
});
