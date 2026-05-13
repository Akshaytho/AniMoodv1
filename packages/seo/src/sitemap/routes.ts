/**
 * Single source of truth for AniMood entity URLs.
 * Every place that builds a URL (frontend, sitemap, JSON-LD) imports from here.
 */

export type EntityKind =
  | 'emotion'
  | 'anime'
  | 'manga'
  | 'manhwa'
  | 'character'
  | 'life-stage'
  | 'theme'
  | 'compare'
  | 'debate'
  | 'taste-profile'
  | 'where-to-watch';

const KIND_PATH: Record<EntityKind, string> = {
  emotion: 'emotion',
  anime: 'anime',
  manga: 'manga',
  manhwa: 'manhwa',
  character: 'character',
  'life-stage': 'life-stage',
  theme: 'theme',
  compare: 'compare',
  debate: 'debate',
  'taste-profile': 'taste-profile',
  'where-to-watch': 'where-to-watch',
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug) && slug.length <= 120;
}

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

export interface ToEntityUrlInput {
  kind: EntityKind;
  slug: string;
  baseUrl?: string;
}

/**
 * Build a canonical entity URL. Throws on invalid slug — fail loud rather
 * than emit a 404-bound link.
 */
export function toEntityUrl({ kind, slug, baseUrl = '' }: ToEntityUrlInput): string {
  if (!isValidSlug(slug)) {
    throw new Error(`Invalid slug "${slug}" for entity kind "${kind}"`);
  }
  const base = normalizeBaseUrl(baseUrl);
  return `${base}/${KIND_PATH[kind]}/${slug}`;
}

export const ALL_ENTITY_KINDS: readonly EntityKind[] = Object.freeze([
  'emotion',
  'anime',
  'manga',
  'manhwa',
  'character',
  'life-stage',
  'theme',
  'compare',
  'debate',
  'taste-profile',
  'where-to-watch',
] as const);
