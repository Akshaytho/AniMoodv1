import type { JsonLd } from './types';

export interface BreadcrumbCrumb {
  name: string;
  url: string;
}

export function buildBreadcrumbList(crumbs: BreadcrumbCrumb[]): JsonLd {
  if (crumbs.length === 0) {
    throw new Error('buildBreadcrumbList: at least one crumb required');
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}
