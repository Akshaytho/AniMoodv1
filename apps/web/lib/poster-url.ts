/**
 * Resolve a poster URL for a title — prefers the value stored on the title
 * row (backfilled via MAL API in commit 15.5), falls back to a static map
 * for slugs not in the DB (e.g. the homepage hero hardcoded list).
 *
 * Per [[animood-image-policy]] — hotlink only, never proxy / never rehost.
 */
import { TRENDING, TRENDING_WEEK } from './posters';

const STATIC_MAP = new Map<string, string>();
for (const t of TRENDING) STATIC_MAP.set(t.slug, t.posterUrl);
for (const t of TRENDING_WEEK) STATIC_MAP.set(t.slug, t.posterUrl);

export interface MaybeWithPoster {
  slug: string;
  posterUrl?: string | null;
}

/** Return the best poster URL we have, preferring the DB column. */
export function resolvePoster(input: MaybeWithPoster): string | null {
  return input.posterUrl ?? STATIC_MAP.get(input.slug) ?? null;
}

/** Static-only lookup for legacy call sites that only have a slug. */
export function posterUrlForSlug(slug: string): string | null {
  return STATIC_MAP.get(slug) ?? null;
}
