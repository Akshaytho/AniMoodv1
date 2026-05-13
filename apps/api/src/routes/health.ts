import { Router, type Request, type Response } from 'express';
import type { Sql } from 'postgres';

export function healthRouter(sql: Sql): Router {
  const router = Router();

  router.get('/health', async (_req: Request, res: Response) => {
    try {
      const [row] = await sql<Array<{ ping: number }>>`SELECT 1 AS ping`;
      // postgres-js returns bigint columns as strings to preserve precision.
      // 500k fits safely in Number — coerce for the JSON response.
      const [budget] = await sql<Array<{ tokens_used: string | number; tokens_cap: string | number }>>`
        SELECT tokens_used, tokens_cap FROM openai_budget WHERE id = 1
      `;
      const used = budget ? Number(budget.tokens_used) : null;
      const cap = budget ? Number(budget.tokens_cap) : null;
      res.json({
        status: 'ok',
        db: row?.ping === 1 ? 'reachable' : 'unexpected',
        budget:
          used !== null && cap !== null
            ? { used, cap, remaining: Math.max(cap - used, 0) }
            : null,
        time: new Date().toISOString(),
      });
    } catch (err) {
      res.status(503).json({
        status: 'degraded',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  return router;
}
