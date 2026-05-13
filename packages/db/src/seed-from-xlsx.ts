import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import xlsx from 'node-xlsx';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, sql as drizzleSql } from 'drizzle-orm';
import * as schema from './schema/index';
import {
  emotions,
  lifeStages,
  characterPsychologies,
  titles,
  characters,
  mappings,
} from './schema/index';

// Resolve repo root from this file's location: packages/db/src/seed-from-xlsx.ts → ../../..
const __dirname = dirname(fileURLToPath(import.meta.url));
const XLSX_PATH = process.env['SEED_XLSX_PATH']
  ?? resolve(__dirname, '..', '..', '..', 'AniMood_Seed_Data.xlsx');

type Row = Array<string | number | null | undefined | Date>;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{ASCII}]/gu, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function parseIntensityRange(s: string | null | undefined): { min: number; max: number } {
  if (!s) return { min: 1, max: 5 };
  const scale: Record<string, number> = { soft: 1, medium: 3, heavy: 5 };
  // Split on en-dash, em-dash, or hyphen
  const parts = s.toLowerCase().split(/[–—\-]/).map((p) => p.trim());
  const a = parts[0] ?? 'soft';
  const b = parts[1] ?? a;
  return { min: scale[a] ?? 1, max: scale[b] ?? 5 };
}

function parseSensitive(s: string | null | undefined): boolean {
  if (!s) return false;
  const v = s.trim().toLowerCase();
  return v === 'yes' || v === 'mild' || v === 'sensitive';
}

function parseTitleType(s: string | null | undefined): 'anime' | 'manga' | 'manhwa' | 'manhua' | 'light_novel' {
  if (!s) return 'anime';
  const v = s.toLowerCase();
  if (v.includes('manhwa')) return 'manhwa';
  if (v.includes('manhua')) return 'manhua';
  if (v.includes('light novel') || v.includes('ln')) return 'light_novel';
  if (v.includes('anime')) return 'anime';
  if (v.includes('manga')) return 'manga';
  return 'anime';
}

function parseTitleStatus(s: string | null | undefined): 'completed' | 'ongoing' | 'hiatus' | 'cancelled' | 'announced' {
  if (!s) return 'completed';
  const v = s.toLowerCase();
  if (v.includes('hiatus')) return 'hiatus';
  if (v.includes('cancel')) return 'cancelled';
  if (v.includes('announce')) return 'announced';
  if (v.includes('ongoing')) return 'ongoing';
  return 'completed';
}

function parseYear(s: unknown): number | null {
  if (s === null || s === undefined || s === '') return null;
  if (s instanceof Date) return s.getFullYear();
  if (typeof s === 'number') return Number.isInteger(s) ? s : Math.round(s);
  const m = String(s).match(/\b(19|20)\d{2}\b/);
  return m ? Number(m[0]) : null;
}

function parseConfidence(s: string | null | undefined): 'low' | 'medium' | 'high' | 'verified' {
  if (!s) return 'medium';
  const v = s.trim().toLowerCase();
  if (v.startsWith('h')) return 'high';
  if (v.startsWith('l')) return 'low';
  if (v.startsWith('v')) return 'verified';
  return 'medium';
}

function asString(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  return String(v);
}

async function main(): Promise<void> {
  const url = process.env['DATABASE_URL'];
  if (!url) {
    console.error('DATABASE_URL not set'); process.exit(1);
  }

  const sheets = xlsx.parse(XLSX_PATH);
  const byName = new Map<string, Row[]>();
  for (const s of sheets) byName.set(s.name, s.data as Row[]);

  const sql = postgres(url, { max: 4, prepare: false });
  const db = drizzle(sql, { schema });

  try {
    // ---- Emotions ----
    const emoRows = (byName.get('Ontology - Emotions') ?? []).slice(1)
      .filter((r) => r[0]);
    const emoIdToDb = new Map<string, number>();
    for (const r of emoRows) {
      const externalId = asString(r[0]);
      const name = asString(r[1]);
      const slug = slugify(name);
      const category = asString(r[2]) || 'Core';
      const definition = asString(r[3]) || '—';
      const { min, max } = parseIntensityRange(asString(r[4]));
      const exampleQuery = asString(r[5]) || null;
      const [row] = await db
        .insert(emotions)
        .values({
          slug, externalId, name, category, definition,
          intensityMin: min, intensityMax: max,
          ...(exampleQuery ? { exampleQuery } : {}),
        })
        .onConflictDoUpdate({
          target: emotions.slug,
          set: { name, category, definition, intensityMin: min, intensityMax: max, updatedAt: new Date() },
        })
        .returning({ id: emotions.id });
      emoIdToDb.set(externalId, row!.id);
    }
    console.log(`[seed] emotions: ${emoRows.length}`);

    // ---- Life stages ----
    const lsRows = (byName.get('Ontology - Life Stages') ?? []).slice(1)
      .filter((r) => r[0]);
    for (const r of lsRows) {
      const externalId = asString(r[0]);
      const name = asString(r[1]);
      const slug = slugify(name);
      const description = asString(r[2]) || '—';
      const sensitive = parseSensitive(asString(r[3]));
      const exampleQuery = asString(r[4]) || null;
      await db
        .insert(lifeStages)
        .values({
          slug, externalId, name, description, sensitive,
          ...(exampleQuery ? { exampleQuery } : {}),
        })
        .onConflictDoUpdate({
          target: lifeStages.slug,
          set: { name, description, sensitive, updatedAt: new Date() },
        });
    }
    console.log(`[seed] life_stages: ${lsRows.length}`);

    // ---- Character psychologies ----
    const psyRows = (byName.get('Ontology - Character Psychology') ?? []).slice(1)
      .filter((r) => r[0]);
    const psyIdToDb = new Map<string, number>();
    for (const r of psyRows) {
      const externalId = asString(r[0]);
      const name = asString(r[1]);
      const slug = slugify(name);
      const description = asString(r[2]) || '—';
      const [row] = await db
        .insert(characterPsychologies)
        .values({ slug, externalId, name, description })
        .onConflictDoUpdate({
          target: characterPsychologies.slug,
          set: { name, description, updatedAt: new Date() },
        })
        .returning({ id: characterPsychologies.id });
      psyIdToDb.set(externalId, row!.id);
    }
    console.log(`[seed] character_psychologies: ${psyRows.length}`);

    // ---- Titles ----
    const titleRows = (byName.get('Titles') ?? []).slice(1).filter((r) => r[0]);
    const titleExtIdToDb = new Map<string, number>();
    for (const r of titleRows) {
      const externalId = asString(r[0]);
      const name = asString(r[1]);
      const slug = slugify(name);
      const type = parseTitleType(asString(r[2]));
      const releaseYear = parseYear(r[3]);
      const status = parseTitleStatus(asString(r[4]));
      const demographic = asString(r[5]) || null;
      const emotionalPositioning = asString(r[6]) || null;
      const spoilerSafeSummary = asString(r[7]) || null;
      const [row] = await db
        .insert(titles)
        .values({
          slug, name, type, status,
          ...(releaseYear !== null ? { releaseYear } : {}),
          ...(demographic ? { demographic } : {}),
          ...(emotionalPositioning ? { emotionalPositioning } : {}),
          ...(spoilerSafeSummary ? { spoilerSafeSummary } : {}),
        })
        .onConflictDoUpdate({
          target: titles.slug,
          set: { name, type, status, updatedAt: new Date() },
        })
        .returning({ id: titles.id });
      titleExtIdToDb.set(externalId, row!.id);
    }
    console.log(`[seed] titles: ${titleRows.length}`);

    // ---- Characters ----
    const charRows = (byName.get('Characters') ?? []).slice(1).filter((r) => r[0]);
    for (const r of charRows) {
      const externalId = asString(r[0]);
      const name = asString(r[1]);
      const titleExtId = asString(r[2]);
      const titleDbId = titleExtIdToDb.get(titleExtId);
      if (!titleDbId) {
        console.warn(`[seed] character ${externalId}: title ${titleExtId} not found, skipping`);
        continue;
      }
      const slug = slugify(name);
      const role = asString(r[4]) || null;
      const psychIds = asString(r[5])
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => psyIdToDb.get(p))
        .filter((id): id is number => typeof id === 'number');
      const arcSummary = asString(r[6]) || null;
      const whyConnect = asString(r[7]) || null;
      await db
        .insert(characters)
        .values({
          slug, externalId, name, titleId: titleDbId,
          psychologyIds: psychIds,
          ...(role ? { role } : {}),
          ...(arcSummary ? { arcSummary } : {}),
          ...(whyConnect ? { whyConnect } : {}),
        })
        .onConflictDoUpdate({
          target: characters.slug,
          set: { name, titleId: titleDbId, psychologyIds: psychIds, updatedAt: new Date() },
        });
    }
    console.log(`[seed] characters: ${charRows.length}`);

    // ---- Title-emotion mappings ----
    const mapRows = (byName.get('Title-Emotion Mappings') ?? []).slice(1).filter((r) => r[0]);
    let inserted = 0;
    let skipped = 0;
    for (const r of mapRows) {
      const titleExtId = asString(r[1]);
      const emotionExtId = asString(r[3]);
      const intensity = Number(r[5]);
      const evidenceNotes = asString(r[6]) || '—';
      const confidence = parseConfidence(asString(r[7]));
      const titleDbId = titleExtIdToDb.get(titleExtId);
      const emoDbId = emoIdToDb.get(emotionExtId);
      if (!titleDbId || !emoDbId) {
        skipped++;
        continue;
      }
      // Idempotent: delete-then-insert per (source/target) tuple
      await db
        .delete(mappings)
        .where(
          drizzleSql`source_table='titles' AND source_id=${titleDbId} AND target_table='emotions' AND target_id=${emoDbId} AND type='title_emotion'`,
        );
      await db.insert(mappings).values({
        type: 'title_emotion',
        sourceTable: 'titles',
        sourceId: titleDbId,
        targetTable: 'emotions',
        targetId: emoDbId,
        intensity: Number.isFinite(intensity) ? intensity : null,
        evidenceNotes,
        evidenceCount: 1,
        confidence,
        status: 'evidence_collected',
      });
      inserted++;
    }
    console.log(`[seed] title_emotion mappings: ${inserted} inserted, ${skipped} skipped`);

    // Summary counts
    const counts = await Promise.all([
      db.select({ c: drizzleSql<number>`COUNT(*)::int` }).from(emotions),
      db.select({ c: drizzleSql<number>`COUNT(*)::int` }).from(lifeStages),
      db.select({ c: drizzleSql<number>`COUNT(*)::int` }).from(characterPsychologies),
      db.select({ c: drizzleSql<number>`COUNT(*)::int` }).from(titles),
      db.select({ c: drizzleSql<number>`COUNT(*)::int` }).from(characters),
      db.select({ c: drizzleSql<number>`COUNT(*)::int` }).from(mappings),
    ]);
    console.log('\n[seed] final counts:');
    console.log(`  emotions:                ${counts[0][0]?.c ?? 0}`);
    console.log(`  life_stages:             ${counts[1][0]?.c ?? 0}`);
    console.log(`  character_psychologies:  ${counts[2][0]?.c ?? 0}`);
    console.log(`  titles:                  ${counts[3][0]?.c ?? 0}`);
    console.log(`  characters:              ${counts[4][0]?.c ?? 0}`);
    console.log(`  mappings:                ${counts[5][0]?.c ?? 0}`);
  } finally {
    await sql.end({ timeout: 5 });
  }
  // remove unused param warning
  void eq;
}

main().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
