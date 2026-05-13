import type { JsonLd, RelatedEntityRef } from './types';
import { toEntityUrl } from '../sitemap/routes';

export interface BuildPersonInput {
  baseUrl: string;
  slug: string;
  name: string;
  description: string;
  appearsIn?: RelatedEntityRef[];
}

/**
 * Characters are modeled as schema.org/Person. They aren't real people, but
 * schema.org has no `FictionalCharacter` type and Person is the convention
 * Google uses for fictional characters in entity SEO.
 */
export function buildPerson(input: BuildPersonInput): JsonLd {
  const jsonld: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: input.name,
    url: toEntityUrl({ kind: 'character', slug: input.slug, baseUrl: input.baseUrl }),
    description: input.description,
  };

  if (input.appearsIn && input.appearsIn.length > 0) {
    jsonld['subjectOf'] = input.appearsIn.map((t) => ({
      '@type': t.kind === 'anime' ? 'TVSeries' : 'CreativeWorkSeries',
      name: t.name,
      url: toEntityUrl({ kind: t.kind, slug: t.slug, baseUrl: input.baseUrl }),
    }));
  }

  return jsonld;
}
