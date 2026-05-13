import type { JsonLd, RelatedEntityRef } from './types';
import { toEntityUrl, type EntityKind } from '../sitemap/routes';

export interface BuildThingInput {
  baseUrl: string;
  kind: Extract<EntityKind, 'emotion' | 'theme' | 'life-stage'>;
  slug: string;
  name: string;
  description: string;
  relatedTitles?: RelatedEntityRef[];
}

export function buildThing(input: BuildThingInput): JsonLd {
  const jsonld: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    name: input.name,
    url: toEntityUrl({ kind: input.kind, slug: input.slug, baseUrl: input.baseUrl }),
    description: input.description,
  };

  if (input.relatedTitles && input.relatedTitles.length > 0) {
    jsonld['subjectOf'] = input.relatedTitles.map((t) => ({
      '@type': t.kind === 'anime' ? 'TVSeries' : 'CreativeWorkSeries',
      name: t.name,
      url: toEntityUrl({ kind: t.kind, slug: t.slug, baseUrl: input.baseUrl }),
    }));
  }

  return jsonld;
}
