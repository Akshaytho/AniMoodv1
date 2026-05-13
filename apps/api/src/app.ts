import express, { type Express } from 'express';
import cookieParser from 'cookie-parser';
import type { Sql } from 'postgres';
import type { DbClient } from '@animood/db';
import { healthRouter } from './routes/health';
import { authRouter, type AuthRouterDeps } from './routes/auth';

export interface CreateAppDeps {
  db: DbClient;
  sql: Sql;
  auth: AuthRouterDeps;
}

export function createApp(deps: CreateAppDeps): Express {
  const app = express();

  app.use(express.json({ limit: '256kb' }));
  app.use(cookieParser());

  app.use(healthRouter(deps.sql));
  app.use(authRouter(deps.auth));

  app.use((_req, res) => {
    res.status(404).json({ error: 'not_found' });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[api] unhandled error:', err);
    res.status(500).json({ error: 'internal_error' });
  });

  return app;
}
