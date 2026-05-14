/**
 * One-shot script: for every title in the DB missing a poster_url,
 * search MAL by name, pick the best match, store the large poster URL
 * (and MAL score / banner where available).
 *
 * Per [[animood-image-policy]] — URLs only, no rehosting.
 *
 * Usage:
 *   DATABASE_URL=... MAL_CLIENT_ID=... pnpm --filter @animood/db run backfill:posters
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, isNull } from 'drizzle-orm';
import * as schema from './schema/index';
import { titles } from './schema/index';

interface MalSearchHit {
  node: {
    id: number;
    title: string;
    main_picture?: { medium: string; large: string };
    mean?: number;
  };
}

async function searchMal(name: string, clientId: string): Promise<MalSearchHit['node'] | null> {
  const url = new URL('https://api.myanimelist.net/v2/anime');
  url.searchParams.set('q', name);
  url.searchParams.set('limit', '4');
  url.searchParams.set('fields', 'id,title,main_picture,mean');
  const res = await fetch(url, { headers: { 'X-MAL-CLIENT-ID': clientId } });
  if (!res.ok) return null;
  const body = (await res.json()) as { data?: MalSearchHit[] };
  if (!body.data || body.data.length === 0) return null;
  // Best match: exact (case-insensitive) name first, else top hit.
  const exact = body.data.find(
    (h) => h.node.title.toLowerCase() === name.toLowerCase(),
  );
  return (exact ?? body.data[0])?.node ?? null;
}

async function main() {
  const url = process.env['DATABASE_URL'];
  const clientId = process.env['MAL_CLIENT_ID'];
  if (!url) { console.error('DATABASE_URL not set'); process.exit(1); }
  if (!clientId) { console.error('MAL_CLIENT_ID not set'); process.exit(1); }

  const sql = postgres(url, { max: 1, prepare: false });
  const db = drizzle(sql, { schema });

  try {
    const rows = await db
      .select({ id: titles.id, name: titles.name, slug: titles.slug })
      .from(titles)
      .where(isNull(titles.posterUrl));
    console.log(`[backfill] ${rows.length} titles missing posters`);

    let ok = 0;
    let miss = 0;
    for (const row of rows) {
      const hit = await searchMal(row.name, clientId).catch(() => null);
      if (!hit?.main_picture?.large) {
        console.log(`  ✗ ${row.name}: no MAL hit`);
        miss++;
        // Tiny rate-limit politeness
        await new Promise((r) => setTimeout(r, 250));
        continue;
      }
      await db
        .update(titles)
        .set({
          posterUrl: hit.main_picture.large,
          malId: hit.id,
          scoreMal: hit.mean ? String(hit.mean) : null,
          updatedAt: new Date(),
        })
        .where(eq(titles.id, row.id));
      console.log(`  ✓ ${row.name} ← ${hit.title} (mal=${hit.id}, score=${hit.mean ?? '?'})`);
      ok++;
      // MAL rate limit is ~3 req/sec; stay well under
      await new Promise((r) => setTimeout(r, 350));
    }
    console.log(`\n[backfill] done. ok=${ok} miss=${miss}`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error('[backfill] failed:', err);
  process.exit(1);
});
