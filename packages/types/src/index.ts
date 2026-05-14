/**
 * Public domain types shared between the API and the frontends.
 *
 * Do NOT import from `@animood/db` here — that pulls in drizzle-orm and
 * postgres-js, which bloats the frontend bundle. These types are written
 * by hand and mirror the DB schema for consumer-facing fields only.
 */

export type TitleKind = 'anime' | 'manga' | 'manhwa' | 'manhua' | 'light_novel';
export type TitleStatusValue =
  | 'completed'
  | 'ongoing'
  | 'hiatus'
  | 'cancelled'
  | 'announced';

export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'verified';
export type MappingStatusValue =
  | 'proposed'
  | 'evidence_collected'
  | 'human_reviewed'
  | 'published'
  | 'contested'
  | 'retired';

export interface PublicTitle {
  id: number;
  slug: string;
  name: string;
  nameOriginal?: string | null;
  type: TitleKind;
  status: TitleStatusValue;
  releaseYear?: number | null;
  endYear?: number | null;
  demographic?: string | null;
  spoilerSafeSummary?: string | null;
  emotionalPositioning?: string | null;
  posterUrl?: string | null;
  bannerUrl?: string | null;
  scoreMal?: number | null;
  scoreAnilist?: number | null;
}

export interface PublicEmotion {
  id: number;
  slug: string;
  name: string;
  category: string;
  definition: string;
  intensityMin: number;
  intensityMax: number;
}

export interface PublicCharacter {
  id: number;
  slug: string;
  name: string;
  titleId: number;
  role?: string | null;
  arcSummary?: string | null;
  whyConnect?: string | null;
}

export interface PublicMapping {
  id: number;
  type: string;
  sourceTable: string;
  sourceId: number;
  targetTable: string;
  targetId: number;
  intensity: number | null;
  evidenceNotes: string;
  evidenceCount: number;
  confidence: ConfidenceLevel;
  confidenceScore?: string | null;
  status: MappingStatusValue;
}

export interface PublicLifeStage {
  id: number;
  slug: string;
  name: string;
  description: string;
  sensitive: boolean;
}

export interface PublicTheme {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
}

/**
 * Lightweight type for emotion tags rendered on title cards. Color hint
 * is the design-token key (e.g. 'loneliness' → text-emotion-loneliness).
 */
export interface EmotionTag {
  slug: string;
  name: string;
  intensity?: number | null;
  colorKey?: string;
}
