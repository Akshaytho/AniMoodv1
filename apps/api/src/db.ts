import { createDbClient, type DbClient } from '@animood/db';
import type { Sql } from 'postgres';

let cached: { db: DbClient; sql: Sql; close: () => Promise<void> } | null = null;

export function getDb(connectionString: string): { db: DbClient; sql: Sql } {
  if (cached) return { db: cached.db, sql: cached.sql };
  cached = createDbClient({ connectionString });
  return { db: cached.db, sql: cached.sql };
}

export async function closeDb(): Promise<void> {
  if (cached) {
    await cached.close();
    cached = null;
  }
}
