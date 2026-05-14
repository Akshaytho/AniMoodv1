import 'server-only';
import { createDbClient, type DbClient } from '@animood/db';
import type { Sql } from 'postgres';

/**
 * Singleton Postgres client for the public site (server components / route
 * handlers ONLY — never import this in a 'use client' file).
 *
 * In dev, Next.js hot-reload would otherwise leak connections on every change.
 * We park the client on globalThis to survive HMR.
 */
declare global {
  // eslint-disable-next-line no-var
  var __animoodDb: { db: DbClient; sql: Sql; close: () => Promise<void> } | undefined;
}

export function db() {
  if (!global.__animoodDb) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set in apps/web environment');
    global.__animoodDb = createDbClient({ connectionString: url, max: 5 });
  }
  return global.__animoodDb;
}
