/**
 * MAL CDN URLs for seeded titles. Maps title slug → poster URL.
 * Temporary until commit 18 backfills the `titles.poster_url` column.
 * See [[animood-image-policy]] — hotlink only, never proxy.
 */
import { TRENDING, TRENDING_WEEK } from './posters';

const MAP = new Map<string, string>();
for (const t of TRENDING) MAP.set(t.slug, t.posterUrl);
for (const t of TRENDING_WEEK) MAP.set(t.slug, t.posterUrl);

// Known additional seeded titles (resolved from MAL API on first use; cached here
// so we don't hit MAL on every render).
const EXTRA: Record<string, string> = {
  'welcome-to-the-nhk': 'https://cdn.myanimelist.net/images/anime/4/85009l.webp',
  'attack-on-titan': 'https://cdn.myanimelist.net/images/anime/10/47347l.webp',
};
for (const [slug, url] of Object.entries(EXTRA)) MAP.set(slug, url);

export function posterUrlForSlug(slug: string): string | null {
  return MAP.get(slug) ?? null;
}
