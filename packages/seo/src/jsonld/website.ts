import type { JsonLd } from './types';
import { normalizeBaseUrl } from '../sitemap/routes';

export interface BuildWebSiteInput {
  baseUrl: string;
  name: string;
  description: string;
  searchUrlTemplate?: string;
}

export function buildWebSite(input: BuildWebSiteInput): JsonLd {
  const base = normalizeBaseUrl(input.baseUrl);
  const jsonld: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: input.name,
    url: base,
    description: input.description,
  };
  if (input.searchUrlTemplate) {
    jsonld['potentialAction'] = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: input.searchUrlTemplate,
      },
      'query-input': 'required name=search_term_string',
    } as never;
  }
  return jsonld;
}
