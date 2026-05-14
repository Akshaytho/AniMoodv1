/**
 * Lightweight slug → human-readable metadata lookups. Reads the seed Excel
 * data committed to apps/web/lib so stubs can show real titles/emotions
 * instead of the slug.
 *
 * This is a temporary bridge until commits 13+ wire each entity page to the
 * DB directly via @animood/db.
 */

import { TRENDING } from './posters';

export interface ResolvedAnime {
  name: string;
  meta: string;
  posterUrl?: string;
  score?: number;
}

export function resolveAnime(slug: string): ResolvedAnime | null {
  const hit = TRENDING.find((t) => t.slug === slug);
  if (hit) {
    const meta: ResolvedAnime = { name: hit.name, meta: hit.meta };
    if (hit.posterUrl !== undefined) meta.posterUrl = hit.posterUrl;
    if (hit.score !== undefined) meta.score = hit.score;
    return meta;
  }
  return null;
}

const EMOTION_NAMES: Record<string, string> = {
  loneliness: 'Loneliness',
  healing: 'Healing',
  revenge: 'Revenge',
  redemption: 'Redemption',
  ambition: 'Ambition',
  grief: 'Grief',
  hope: 'Hope',
  'existential-dread': 'Existential Dread',
  'peaceful-comfort': 'Peaceful Comfort',
  'emotional-devastation': 'Emotional Devastation',
  'identity-crisis': 'Identity Crisis',
  'moral-ambiguity': 'Moral Ambiguity',
  burnout: 'Burnout',
  rebuilding: 'Rebuilding',
  nostalgia: 'Nostalgia',
  freedom: 'Freedom',
};

export function resolveEmotion(slug: string): string | null {
  return EMOTION_NAMES[slug] ?? null;
}

const LIFE_STAGE_NAMES: Record<string, string> = {
  'teenage-confusion': 'Teenage Confusion',
  'early-adulthood-pressure': 'Early Adulthood Pressure',
  'loneliness-in-twenties': 'Loneliness in Twenties',
  'burnout-from-work-or-study': 'Burnout',
  'first-real-grief': 'First Real Grief',
  'family-distance': 'Family Distance',
};

export function resolveLifeStage(slug: string): string | null {
  return LIFE_STAGE_NAMES[slug] ?? null;
}

export function humanize(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
