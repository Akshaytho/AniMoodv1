import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';

export type DbClient = ReturnType<typeof drizzle<typeof schema>>;

export interface CreateDbClientOptions {
  connectionString: string;
  max?: number;
  idleTimeoutSeconds?: number;
}

export function createDbClient(opts: CreateDbClientOptions): {
  db: DbClient;
  sql: ReturnType<typeof postgres>;
  close: () => Promise<void>;
} {
  const sql = postgres(opts.connectionString, {
    max: opts.max ?? 10,
    idle_timeout: opts.idleTimeoutSeconds ?? 30,
    prepare: false,
  });
  const db = drizzle(sql, { schema });
  return {
    db,
    sql,
    close: async () => {
      await sql.end({ timeout: 5 });
    },
  };
}
