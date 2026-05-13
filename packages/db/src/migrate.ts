import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(__dirname, '..', 'migrations');

async function main(): Promise<void> {
  const url = process.env['DATABASE_URL'];
  if (!url) {
    console.error('DATABASE_URL is not set. Aborting.');
    process.exit(1);
  }

  console.log('[migrate] connecting to Postgres...');
  const sql = postgres(url, { max: 1, prepare: false });

  try {
    // Acquire an advisory lock so two concurrent migrators don't race.
    const LOCK_KEY = 4242420001;
    console.log(`[migrate] acquiring advisory lock ${LOCK_KEY}...`);
    await sql`SELECT pg_advisory_lock(${LOCK_KEY})`;

    try {
      console.log('[migrate] applying drizzle-generated migrations...');
      const db = drizzle(sql);
      await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
      console.log('[migrate] drizzle migrations done.');

      // Apply hand-written supplementary SQL files (prefixed with `manual-`).
      const manualFiles = readdirSync(MIGRATIONS_FOLDER)
        .filter((f) => f.startsWith('manual-') && f.endsWith('.sql'))
        .sort();
      for (const file of manualFiles) {
        const path = resolve(MIGRATIONS_FOLDER, file);
        const body = readFileSync(path, 'utf8');
        console.log(`[migrate] applying ${file}...`);
        await sql.unsafe(body);
      }
      console.log(`[migrate] applied ${manualFiles.length} manual SQL file(s).`);
    } finally {
      await sql`SELECT pg_advisory_unlock(${LOCK_KEY})`;
    }
  } finally {
    await sql.end({ timeout: 5 });
  }

  console.log('[migrate] done.');
}

main().catch((err) => {
  console.error('[migrate] failed:', err);
  process.exit(1);
});
