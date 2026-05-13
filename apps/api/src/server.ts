import { loadEnv } from './env';
import { getDb, closeDb } from './db';
import { createApp } from './app';

async function main(): Promise<void> {
  const env = loadEnv();
  const { db, sql } = getDb(env.DATABASE_URL);

  const app = createApp({
    db,
    sql,
    auth: {
      adminEmail: env.DASHBOARD_ADMIN_EMAIL,
      adminPasswordHash: env.DASHBOARD_ADMIN_PASSWORD_HASH,
      sessionSecret: env.SESSION_SECRET,
      cookieSecure: env.NODE_ENV === 'production',
    },
  });

  const server = app.listen(env.PORT, () => {
    console.log(`[api] listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`[api] received ${signal}, shutting down...`);
    server.close();
    await closeDb();
    process.exit(0);
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((err) => {
  console.error('[api] startup failed:', err);
  process.exit(1);
});
