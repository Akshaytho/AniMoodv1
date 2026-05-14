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
