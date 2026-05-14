/**
 * Curated trending titles for the homepage hero row. Image URLs come straight
 * from cdn.myanimelist.net (free for hotlinking per MAL TOS — that's what
 * they're served for). Replaced in commit 12+ by real DB rows once we backfill
 * the `posterUrl` column from AniList.
 *
 * @animood-image-policy hotlink-only, never proxy / never rehost.
 */

export interface TrendingTitle {
  slug: string;
  name: string;
  meta: string;
  posterUrl: string;
  score: number;
  emotions: Array<{ slug: string; name: string; colorKey: string }>;
}

export const TRENDING: TrendingTitle[] = [
  {
    slug: 'vinland-saga',
    name: 'Vinland Saga',
    meta: 'Anime · 2019',
    posterUrl: 'https://cdn.myanimelist.net/images/anime/1500/103005l.webp',
    score: 8.74,
    emotions: [
      { slug: 'revenge', name: 'Revenge', colorKey: 'revenge' },
      { slug: 'redemption', name: 'Redemption', colorKey: 'redemption' },
      { slug: 'rebuilding', name: 'Rebuilding', colorKey: 'rebuilding' },
    ],
  },
  {
    slug: 'mob-psycho-100',
    name: 'Mob Psycho 100',
    meta: 'Anime · 2016',
    posterUrl: 'https://cdn.myanimelist.net/images/anime/8/80356l.webp',
    score: 8.50,
    emotions: [
      { slug: 'identity', name: 'Identity', colorKey: 'identity' },
      { slug: 'hope', name: 'Hope', colorKey: 'hope' },
      { slug: 'healing', name: 'Healing', colorKey: 'healing' },
    ],
  },
  {
    slug: 'a-silent-voice',
    name: 'A Silent Voice',
    meta: 'Film · 2016',
    posterUrl: 'https://cdn.myanimelist.net/images/anime/1122/96435l.webp',
    score: 8.94,
    emotions: [
      { slug: 'grief', name: 'Guilt', colorKey: 'grief' },
      { slug: 'redemption', name: 'Redemption', colorKey: 'redemption' },
      { slug: 'healing', name: 'Healing', colorKey: 'healing' },
    ],
  },
  {
    slug: 'mushoku-tensei',
    name: 'Mushoku Tensei',
    meta: 'Anime · 2021',
    posterUrl: 'https://cdn.myanimelist.net/images/anime/1530/117776l.webp',
    score: 8.43,
    emotions: [
      { slug: 'rebuilding', name: 'Rebuilding', colorKey: 'rebuilding' },
      { slug: 'ambition', name: 'Ambition', colorKey: 'ambition' },
      { slug: 'redemption', name: 'Redemption', colorKey: 'redemption' },
    ],
  },
  {
    slug: 'march-comes-in-like-a-lion',
    name: 'March Comes In Like a Lion',
    meta: 'Anime · 2016',
    // Verified via api.myanimelist.net/v2/anime/31646 — main_picture.large
    posterUrl: 'https://cdn.myanimelist.net/images/anime/3/82899l.webp',
    score: 8.36,
    emotions: [
      { slug: 'loneliness', name: 'Loneliness', colorKey: 'loneliness' },
      { slug: 'healing', name: 'Healing', colorKey: 'healing' },
      { slug: 'rebuilding', name: 'Rebuilding', colorKey: 'rebuilding' },
    ],
  },
];
