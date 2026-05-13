import type { JsonLd, RelatedEntityRef } from './types';
import { toEntityUrl } from '../sitemap/routes';

export interface BuildTVSeriesInput {
  baseUrl: string;
  slug: string;
  name: string;
  nameOriginal?: string;
  description: string;
  genre?: string[];
  datePublished?: string;
  characters: RelatedEntityRef[];
  relatedTitles?: RelatedEntityRef[];
  themes?: RelatedEntityRef[];
  emotions?: RelatedEntityRef[];
}

export function buildTVSeries(input: BuildTVSeriesInput): JsonLd {
  const url = toEntityUrl({ kind: 'anime', slug: input.slug, baseUrl: input.baseUrl });

  const jsonld: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: input.name,
    url,
    description: input.description,
  };

  if (input.nameOriginal) jsonld['alternateName'] = input.nameOriginal;
  if (input.genre && input.genre.length > 0) jsonld['genre'] = input.genre;
  if (input.datePublished) jsonld['datePublished'] = input.datePublished;

  if (input.characters.length > 0) {
    jsonld['character'] = input.characters.map((c) => ({
      '@type': 'Person',
      name: c.name,
      url: toEntityUrl({ kind: 'character', slug: c.slug, baseUrl: input.baseUrl }),
    }));
  }

  if (input.relatedTitles && input.relatedTitles.length > 0) {
    jsonld['isRelatedTo'] = input.relatedTitles.map((t) => ({
      '@type': t.kind === 'anime' ? 'TVSeries' : 'CreativeWorkSeries',
      name: t.name,
      url: toEntityUrl({ kind: t.kind, slug: t.slug, baseUrl: input.baseUrl }),
    }));
  }

  const aboutRefs = [...(input.themes ?? []), ...(input.emotions ?? [])];
  if (aboutRefs.length > 0) {
    jsonld['about'] = aboutRefs.map((a) => ({
      '@type': 'Thing',
      name: a.name,
      url: toEntityUrl({ kind: a.kind, slug: a.slug, baseUrl: input.baseUrl }),
    }));
  }

  return jsonld;
}
