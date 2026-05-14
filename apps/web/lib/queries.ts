import 'server-only';
import { and, desc, eq, ne, sql, inArray, type SQL } from 'drizzle-orm';
import {
  titles,
  emotions,
  characters,
  mappings,
  type Title,
  type Emotion,
  type Character,
} from '@animood/db';
import { db } from './db';

export interface TitleWithEmotionAggregates extends Title {
  topEmotions: Array<{
    emotion: Emotion;
    intensity: number | null;
    confidence: string;
    evidenceNotes: string;
  }>;
}

export async function getTitleBySlug(slug: string): Promise<TitleWithEmotionAggregates | null> {
  const { db: drizzle } = db();
  const [t] = await drizzle
    .select()
    .from(titles)
    .where(eq(titles.slug, slug))
    .limit(1);
  if (!t) return null;

  // Title-emotion mappings, joined to emotion rows, ordered by intensity then confidence_score
  const rows = await drizzle
    .select({
      emotion: emotions,
      intensity: mappings.intensity,
      confidence: mappings.confidence,
      evidenceNotes: mappings.evidenceNotes,
    })
    .from(mappings)
    .innerJoin(emotions, eq(mappings.targetId, emotions.id))
    .where(
      and(
        eq(mappings.type, 'title_emotion'),
        eq(mappings.sourceTable, 'titles'),
        eq(mappings.sourceId, t.id),
        ne(mappings.status, 'retired'),
      ),
    )
    .orderBy(desc(mappings.intensity), desc(mappings.confidence));

  return { ...t, topEmotions: rows };
}

export async function getCharactersForTitle(titleId: number): Promise<Character[]> {
  const { db: drizzle } = db();
  return drizzle
    .select()
    .from(characters)
    .where(eq(characters.titleId, titleId))
    .orderBy(characters.id)
    .limit(12);
}

export interface SimilarTitleRow {
  title: Title;
  sharedEmotionCount: number;
  sharedEmotionNames: string[];
}

/**
 * Titles ranked by count of shared emotion mappings with `titleId`.
 * Phase A: pure SQL aggregate (no embeddings yet — those land via W6).
 */
export async function getSimilarTitles(titleId: number, limit = 6): Promise<SimilarTitleRow[]> {
  const { db: drizzle } = db();

  // Subquery: emotion ids this title connects to
  const ourEmotionIds = await drizzle
    .select({ id: mappings.targetId })
    .from(mappings)
    .where(
      and(
        eq(mappings.type, 'title_emotion'),
        eq(mappings.sourceTable, 'titles'),
        eq(mappings.sourceId, titleId),
        ne(mappings.status, 'retired'),
      ),
    );
  const ids = ourEmotionIds.map((r) => r.id);
  if (ids.length === 0) return [];

  // Sibling mappings for the same emotion ids, EXCLUDING this title
  const siblings = await drizzle
    .select({
      titleId: mappings.sourceId,
      emotionId: mappings.targetId,
    })
    .from(mappings)
    .where(
      and(
        eq(mappings.type, 'title_emotion'),
        eq(mappings.sourceTable, 'titles'),
        ne(mappings.sourceId, titleId),
        ne(mappings.status, 'retired'),
        inArray(mappings.targetId, ids),
      ),
    );

  // Aggregate in memory (75 mappings total — fine for Phase A)
  const counts = new Map<number, { count: number; emoIds: Set<number> }>();
  for (const s of siblings) {
    const cur = counts.get(s.titleId) ?? { count: 0, emoIds: new Set() };
    cur.count += 1;
    cur.emoIds.add(s.emotionId);
    counts.set(s.titleId, cur);
  }
  const ranked = Array.from(counts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit);

  if (ranked.length === 0) return [];

  const siblingTitleIds = ranked.map(([id]) => id);
  const titleRows = await drizzle
    .select()
    .from(titles)
    .where(inArray(titles.id, siblingTitleIds));
  const allEmoIds = new Set<number>();
  for (const [, v] of ranked) for (const id of v.emoIds) allEmoIds.add(id);
  const emoRows = await drizzle
    .select({ id: emotions.id, name: emotions.name })
    .from(emotions)
    .where(inArray(emotions.id, Array.from(allEmoIds)));
  const emoNameById = new Map(emoRows.map((e) => [e.id, e.name] as const));

  return ranked
    .map(([id, agg]) => {
      const t = titleRows.find((x) => x.id === id);
      if (!t) return null;
      return {
        title: t,
        sharedEmotionCount: agg.count,
        sharedEmotionNames: Array.from(agg.emoIds)
          .map((eid) => emoNameById.get(eid))
          .filter((n): n is string => typeof n === 'string'),
      } satisfies SimilarTitleRow;
    })
    .filter((r): r is SimilarTitleRow => r !== null);
}

export interface EmotionWithTitles extends Emotion {
  titles: Array<{
    title: Title;
    intensity: number | null;
    confidence: string;
    evidenceNotes: string;
  }>;
  /** Emotions that co-occur in the same titles, ranked by overlap count. */
  related: Array<{ emotion: Emotion; overlapCount: number }>;
}

export async function getEmotionBySlug(slug: string): Promise<EmotionWithTitles | null> {
  const { db: drizzle } = db();
  const [e] = await drizzle.select().from(emotions).where(eq(emotions.slug, slug)).limit(1);
  if (!e) return null;

  // All non-retired title-emotion mappings targeting this emotion, with the title
  const rows = await drizzle
    .select({
      title: titles,
      intensity: mappings.intensity,
      confidence: mappings.confidence,
      evidenceNotes: mappings.evidenceNotes,
    })
    .from(mappings)
    .innerJoin(titles, eq(mappings.sourceId, titles.id))
    .where(
      and(
        eq(mappings.type, 'title_emotion'),
        eq(mappings.sourceTable, 'titles'),
        eq(mappings.targetTable, 'emotions'),
        eq(mappings.targetId, e.id),
        ne(mappings.status, 'retired'),
      ),
    )
    .orderBy(desc(mappings.intensity), desc(mappings.confidence));

  // Related emotions: find titles mapped to this emotion, then count other emotions in those titles
  const titleIds = rows.map((r) => r.title.id);
  let related: Array<{ emotion: Emotion; overlapCount: number }> = [];
  if (titleIds.length > 0) {
    const siblings = await drizzle
      .select({
        emotionId: mappings.targetId,
      })
      .from(mappings)
      .where(
        and(
          eq(mappings.type, 'title_emotion'),
          eq(mappings.sourceTable, 'titles'),
          eq(mappings.targetTable, 'emotions'),
          ne(mappings.targetId, e.id),
          ne(mappings.status, 'retired'),
          inArray(mappings.sourceId, titleIds),
        ),
      );
    const counts = new Map<number, number>();
    for (const s of siblings) counts.set(s.emotionId, (counts.get(s.emotionId) ?? 0) + 1);
    const relatedIds = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    if (relatedIds.length > 0) {
      const relatedEmoRows = await drizzle
        .select()
        .from(emotions)
        .where(inArray(emotions.id, relatedIds.map(([id]) => id)));
      related = relatedIds
        .map(([id, count]) => {
          const emo = relatedEmoRows.find((x) => x.id === id);
          return emo ? { emotion: emo, overlapCount: count } : null;
        })
        .filter((r): r is { emotion: Emotion; overlapCount: number } => r !== null);
    }
  }

  return { ...e, titles: rows, related };
}

export interface DiscoverFilter {
  q?: string;
  emotionSlug?: string;
  type?: 'anime' | 'manga' | 'manhwa' | 'manhua' | 'light_novel';
  minIntensity?: number;
  sort?: 'top' | 'recent' | 'name';
}

export interface DiscoverRow {
  title: Title;
  topEmotions: Array<{
    emotion: Pick<Emotion, 'id' | 'slug' | 'name'>;
    intensity: number | null;
  }>;
  bestMatch?: { emotionName: string; intensity: number | null } | undefined;
}

/**
 * Returns titles filtered + ranked for the /discover page. Phase A: in-memory
 * sort after pulling the 30 seeded titles (data is small enough).
 */
export async function getDiscoverResults(filter: DiscoverFilter): Promise<DiscoverRow[]> {
  const { db: drizzle } = db();

  // Optional emotion filter — resolve slug to id once
  let emotionFilterId: number | null = null;
  if (filter.emotionSlug) {
    const [e] = await drizzle
      .select({ id: emotions.id })
      .from(emotions)
      .where(eq(emotions.slug, filter.emotionSlug))
      .limit(1);
    if (e) emotionFilterId = e.id;
  }

  // Base title pull (with optional type filter)
  const baseConditions = filter.type ? [eq(titles.type, filter.type)] : [];
  const allTitles = await drizzle
    .select()
    .from(titles)
    .where(baseConditions.length > 0 ? and(...baseConditions) : undefined);

  if (allTitles.length === 0) return [];

  const titleIds = allTitles.map((t) => t.id);

  // Pull all (non-retired) title_emotion mappings for these titles
  const mappingConditions: SQL[] = [
    eq(mappings.type, 'title_emotion'),
    eq(mappings.sourceTable, 'titles'),
    eq(mappings.targetTable, 'emotions'),
    ne(mappings.status, 'retired'),
    inArray(mappings.sourceId, titleIds),
  ];
  if (typeof filter.minIntensity === 'number') {
    mappingConditions.push(sql`${mappings.intensity} >= ${filter.minIntensity}`);
  }
  const allMappings = await drizzle
    .select({
      titleId: mappings.sourceId,
      emotionId: mappings.targetId,
      intensity: mappings.intensity,
      confidence: mappings.confidence,
    })
    .from(mappings)
    .where(and(...mappingConditions));

  // Index emotions for label lookup
  const allEmotions = await drizzle
    .select({ id: emotions.id, slug: emotions.slug, name: emotions.name })
    .from(emotions);
  const emoById = new Map(allEmotions.map((e) => [e.id, e] as const));

  // Build per-title rows
  const rows: DiscoverRow[] = allTitles.map((t) => {
    const tMappings = allMappings
      .filter((m) => m.titleId === t.id)
      .sort((a, b) => (b.intensity ?? 0) - (a.intensity ?? 0));
    const topEmotions = tMappings.slice(0, 4).flatMap((m) => {
      const emo = emoById.get(m.emotionId);
      return emo ? [{ emotion: emo, intensity: m.intensity }] : [];
    });
    const bestForFilter = emotionFilterId
      ? tMappings.find((m) => m.emotionId === emotionFilterId)
      : null;
    return {
      title: t,
      topEmotions,
      ...(bestForFilter
        ? {
            bestMatch: {
              emotionName: emoById.get(bestForFilter.emotionId)?.name ?? '?',
              intensity: bestForFilter.intensity,
            },
          }
        : {}),
    };
  });

  let filtered = rows;
  if (emotionFilterId !== null) {
    filtered = filtered.filter((r) => r.bestMatch !== undefined);
  }
  if (filter.q && filter.q.trim().length > 0) {
    const needle = filter.q.toLowerCase();
    filtered = filtered.filter((r) => r.title.name.toLowerCase().includes(needle));
  }

  // Sort
  const sort = filter.sort ?? 'top';
  filtered.sort((a, b) => {
    if (sort === 'name') return a.title.name.localeCompare(b.title.name);
    if (sort === 'recent') return (b.title.releaseYear ?? 0) - (a.title.releaseYear ?? 0);
    // 'top' — by bestMatch intensity if filtering by emotion, otherwise by max top-emotion intensity
    const ai = a.bestMatch?.intensity ?? a.topEmotions[0]?.intensity ?? 0;
    const bi = b.bestMatch?.intensity ?? b.topEmotions[0]?.intensity ?? 0;
    return bi - ai;
  });

  return filtered;
}

export async function getAllEmotionsForFilter(): Promise<Pick<Emotion, 'id' | 'slug' | 'name'>[]> {
  const { db: drizzle } = db();
  return drizzle
    .select({ id: emotions.id, slug: emotions.slug, name: emotions.name })
    .from(emotions)
    .orderBy(emotions.name);
}

/** Top emotions across all titles — used as a fallback / discovery rail. */
export async function getTopEmotionsForDiscovery(limit = 12): Promise<Emotion[]> {
  const { db: drizzle } = db();
  const rows = await drizzle
    .select({
      emotion: emotions,
      cnt: sql<number>`COUNT(${mappings.id})::int`.as('cnt'),
    })
    .from(emotions)
    .leftJoin(
      mappings,
      and(eq(mappings.targetId, emotions.id), eq(mappings.type, 'title_emotion')),
    )
    .groupBy(emotions.id)
    .orderBy(desc(sql<number>`COUNT(${mappings.id})`))
    .limit(limit);
  return rows.map((r) => r.emotion);
}

// drizzle-orm SQL helper export to keep tsc happy in callers
export const _sql: typeof sql = sql;
export type _Sql = SQL;
