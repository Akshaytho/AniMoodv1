/**
 * Curated trending titles for homepage rows. URLs come straight from MAL CDN
 * (free for hotlinking per MAL TOS). Verified via api.myanimelist.net.
 * @animood-image-policy hotlink-only, never proxy / never rehost.
 */

export interface TrendingTitle {
  slug: string;
  malId: number;
  name: string;
  meta: string;
  posterUrl: string;
  score: number;
  emotions: Array<{ slug: string; name: string; colorKey: string }>;
}

export interface TrendingWeekItem {
  rank: number;
  slug: string;
  malId: number;
  name: string;
  posterUrl: string;
  score: number;
  tag: string;
}

export const TRENDING: TrendingTitle[] = [
  {
    slug: 'vinland-saga',
    malId: 37521,
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
    malId: 32182,
    name: 'Mob Psycho 100',
    meta: 'Anime · 2016',
    posterUrl: 'https://cdn.myanimelist.net/images/anime/8/80356l.webp',
    score: 8.5,
    emotions: [
      { slug: 'identity', name: 'Identity', colorKey: 'identity' },
      { slug: 'hope', name: 'Hope', colorKey: 'hope' },
      { slug: 'healing', name: 'Healing', colorKey: 'healing' },
    ],
  },
  {
    slug: 'a-silent-voice',
    malId: 28851,
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
    malId: 39535,
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
    malId: 31646,
    name: 'March Comes In Like a Lion',
    meta: 'Anime · 2016',
    posterUrl: 'https://cdn.myanimelist.net/images/anime/3/82899l.webp',
    score: 8.36,
    emotions: [
      { slug: 'loneliness', name: 'Loneliness', colorKey: 'loneliness' },
      { slug: 'healing', name: 'Healing', colorKey: 'healing' },
      { slug: 'rebuilding', name: 'Rebuilding', colorKey: 'rebuilding' },
    ],
  },
];

export const TRENDING_WEEK: TrendingWeekItem[] = [
  {
    rank: 1,
    slug: 'frieren-beyond-journeys-end',
    malId: 52991,
    name: "Frieren: Beyond Journey's End",
    posterUrl: 'https://cdn.myanimelist.net/images/anime/1015/138006l.webp',
    score: 9.27,
    tag: 'Nostalgia',
  },
  {
    rank: 2,
    slug: 'jujutsu-kaisen-2',
    malId: 51009,
    name: 'Jujutsu Kaisen S2',
    posterUrl: 'https://cdn.myanimelist.net/images/anime/1792/138022l.webp',
    score: 8.7,
    tag: 'Devastation',
  },
  {
    rank: 3,
    slug: 'oshi-no-ko',
    malId: 52034,
    name: 'Oshi no Ko',
    posterUrl: 'https://cdn.myanimelist.net/images/anime/1812/134736l.webp',
    score: 8.53,
    tag: 'Ambition',
  },
  {
    rank: 4,
    slug: 'chainsaw-man',
    malId: 44511,
    name: 'Chainsaw Man',
    posterUrl: 'https://cdn.myanimelist.net/images/anime/1806/126216l.webp',
    score: 8.43,
    tag: 'Identity',
  },
  {
    rank: 5,
    slug: 'solo-leveling',
    malId: 52299,
    name: 'Solo Leveling',
    posterUrl: 'https://cdn.myanimelist.net/images/anime/1801/142390l.webp',
    score: 8.16,
    tag: 'Ambition',
  },
];
