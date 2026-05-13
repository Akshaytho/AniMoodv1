import { and, desc, eq, sql as drizzleSql } from 'drizzle-orm';
import type { DbClient } from '@animood/db';
import { mappings, titles, signals } from '@animood/db';

export type MappingStatus =
  | 'proposed'
  | 'evidence_collected'
  | 'human_reviewed'
  | 'published'
  | 'contested'
  | 'retired';

export interface ListMappingsFilter {
  status?: MappingStatus | undefined;
  limit: number;
  offset: number;
}

export interface MappingListRow {
  id: number;
  type: string;
  sourceTable: string;
  sourceId: number;
  sourceName: string | null;
  sourceSlug: string | null;
  targetTable: string;
  targetId: number;
  intensity: number | null;
  evidenceNotes: string;
  evidenceCount: number;
  confidence: string;
  confidenceScore: string | null;
  status: string;
  createdAt: Date;
}

export async function listMappings(
  db: DbClient,
  filter: ListMappingsFilter,
): Promise<{ rows: MappingListRow[]; total: number }> {
  const baseCondition = filter.status
    ? eq(mappings.status, filter.status)
    : undefined;

  // Pull mappings joined to titles when source_table='titles' (most common in Phase A).
  const rows = await db
    .select({
      id: mappings.id,
      type: mappings.type,
      sourceTable: mappings.sourceTable,
      sourceId: mappings.sourceId,
      sourceName: titles.name,
      sourceSlug: titles.slug,
      targetTable: mappings.targetTable,
      targetId: mappings.targetId,
      intensity: mappings.intensity,
      evidenceNotes: mappings.evidenceNotes,
      evidenceCount: mappings.evidenceCount,
      confidence: mappings.confidence,
      confidenceScore: mappings.confidenceScore,
      status: mappings.status,
      createdAt: mappings.createdAt,
    })
    .from(mappings)
    .leftJoin(
      titles,
      and(eq(mappings.sourceTable, drizzleSql`'titles'`), eq(mappings.sourceId, titles.id)),
    )
    .where(baseCondition)
    .orderBy(desc(mappings.confidenceScore), desc(mappings.createdAt))
    .limit(filter.limit)
    .offset(filter.offset);

  const countResult = await db
    .select({ count: drizzleSql<number>`COUNT(*)::int` })
    .from(mappings)
    .where(baseCondition);
  const total = countResult[0]?.count ?? 0;

  return { rows, total };
}

export interface MappingDetail extends MappingListRow {
  signals: Array<{
    id: number;
    sourceType: string;
    sourceUrl: string | null;
    extractedPattern: string;
    intensityHint: number | null;
    confidenceScore: number | null;
    createdAt: Date;
  }>;
}

export async function getMappingDetail(
  db: DbClient,
  id: number,
): Promise<MappingDetail | null> {
  const [row] = await db
    .select({
      id: mappings.id,
      type: mappings.type,
      sourceTable: mappings.sourceTable,
      sourceId: mappings.sourceId,
      sourceName: titles.name,
      sourceSlug: titles.slug,
      targetTable: mappings.targetTable,
      targetId: mappings.targetId,
      intensity: mappings.intensity,
      evidenceNotes: mappings.evidenceNotes,
      evidenceCount: mappings.evidenceCount,
      confidence: mappings.confidence,
      confidenceScore: mappings.confidenceScore,
      status: mappings.status,
      createdAt: mappings.createdAt,
    })
    .from(mappings)
    .leftJoin(
      titles,
      and(eq(mappings.sourceTable, drizzleSql`'titles'`), eq(mappings.sourceId, titles.id)),
    )
    .where(eq(mappings.id, id))
    .limit(1);

  if (!row) return null;

  // Pull related signals when sourceTable='titles' (otherwise skip — characters etc. tracked separately).
  const sigs =
    row.sourceTable === 'titles'
      ? await db
          .select({
            id: signals.id,
            sourceType: signals.sourceType,
            sourceUrl: signals.sourceUrl,
            extractedPattern: signals.extractedPattern,
            intensityHint: signals.intensityHint,
            confidenceScore: signals.confidenceScore,
            createdAt: signals.createdAt,
          })
          .from(signals)
          .where(eq(signals.titleId, row.sourceId))
          .orderBy(desc(signals.createdAt))
          .limit(50)
      : [];

  return { ...row, signals: sigs };
}

export interface UpdateMappingInput {
  intensity?: number | undefined;
  evidenceNotes?: string | undefined;
  confidence?: 'low' | 'medium' | 'high' | 'verified' | undefined;
}

export async function approveMapping(
  db: DbClient,
  id: number,
  reviewer: string,
): Promise<{ updated: boolean }> {
  const result = await db
    .update(mappings)
    .set({
      status: 'human_reviewed',
      reviewedBy: reviewer,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(mappings.id, id))
    .returning({ id: mappings.id });
  return { updated: result.length > 0 };
}

export async function rejectMapping(
  db: DbClient,
  id: number,
  reviewer: string,
): Promise<{ updated: boolean }> {
  const result = await db
    .update(mappings)
    .set({
      status: 'retired',
      reviewedBy: reviewer,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(mappings.id, id))
    .returning({ id: mappings.id });
  return { updated: result.length > 0 };
}

export async function updateMapping(
  db: DbClient,
  id: number,
  patch: UpdateMappingInput,
  reviewer: string,
): Promise<{ updated: boolean }> {
  const set: Partial<typeof mappings.$inferInsert> = {
    reviewedBy: reviewer,
    reviewedAt: new Date(),
    updatedAt: new Date(),
    status: 'human_reviewed',
  };
  if (patch.intensity !== undefined) set.intensity = patch.intensity;
  if (patch.evidenceNotes !== undefined) set.evidenceNotes = patch.evidenceNotes;
  if (patch.confidence !== undefined) set.confidence = patch.confidence;
  const result = await db
    .update(mappings)
    .set(set)
    .where(eq(mappings.id, id))
    .returning({ id: mappings.id });
  return { updated: result.length > 0 };
}

export async function mappingsStats(
  db: DbClient,
): Promise<Record<string, number>> {
  const rows = await db
    .select({
      status: mappings.status,
      count: drizzleSql<number>`COUNT(*)::int`,
    })
    .from(mappings)
    .groupBy(mappings.status);
  const out: Record<string, number> = {};
  for (const r of rows) out[r.status] = Number(r.count);
  return out;
}
