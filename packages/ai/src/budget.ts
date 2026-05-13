import type { Sql } from 'postgres';

export class BudgetExceededError extends Error {
  constructor(
    readonly tokensUsed: number,
    readonly tokensCap: number,
    readonly requested: number,
  ) {
    super(
      `OpenAI token budget exhausted: ${tokensUsed}/${tokensCap} used, request for ${requested} refused`,
    );
    this.name = 'BudgetExceededError';
  }
}

export interface Budget {
  /**
   * Atomically reserve up to `estimatedTokens` of budget before an API call.
   * Throws `BudgetExceededError` if it would exceed the cap.
   * Returns the new running total (post-debit).
   */
  reserve(estimatedTokens: number): Promise<number>;

  /**
   * Reconcile after a call completes. If `actualTokens > estimatedTokens`,
   * debits the difference. If `actualTokens < estimatedTokens`, refunds.
   * Cannot make the row drop below zero.
   */
  reconcile(estimatedTokens: number, actualTokens: number): Promise<number>;

  /** Read current usage without mutating. */
  status(): Promise<{ used: number; cap: number; remaining: number }>;
}

export function createBudget(sql: Sql): Budget {
  return {
    async reserve(estimatedTokens) {
      if (!Number.isFinite(estimatedTokens) || estimatedTokens <= 0) {
        throw new Error(`Invalid estimatedTokens: ${estimatedTokens}`);
      }
      // Atomic conditional UPDATE: only commits if the new total fits the cap.
      const rows = await sql<Array<{ tokens_used: number; tokens_cap: number }>>`
        UPDATE openai_budget
           SET tokens_used = tokens_used + ${estimatedTokens},
               updated_at = NOW()
         WHERE id = 1 AND tokens_used + ${estimatedTokens} <= tokens_cap
        RETURNING tokens_used, tokens_cap
      `;
      if (rows.length === 0) {
        const [snapshot] = await sql<Array<{ tokens_used: number; tokens_cap: number }>>`
          SELECT tokens_used, tokens_cap FROM openai_budget WHERE id = 1
        `;
        const used = snapshot?.tokens_used ?? 0;
        const cap = snapshot?.tokens_cap ?? 0;
        throw new BudgetExceededError(used, cap, estimatedTokens);
      }
      return rows[0]!.tokens_used;
    },

    async reconcile(estimatedTokens, actualTokens) {
      const delta = actualTokens - estimatedTokens;
      if (delta === 0) {
        const [row] = await sql<Array<{ tokens_used: number }>>`
          SELECT tokens_used FROM openai_budget WHERE id = 1
        `;
        return row?.tokens_used ?? 0;
      }
      const rows = await sql<Array<{ tokens_used: number }>>`
        UPDATE openai_budget
           SET tokens_used = GREATEST(tokens_used + ${delta}, 0),
               updated_at = NOW()
         WHERE id = 1
        RETURNING tokens_used
      `;
      return rows[0]?.tokens_used ?? 0;
    },

    async status() {
      const [row] = await sql<Array<{ tokens_used: number; tokens_cap: number }>>`
        SELECT tokens_used, tokens_cap FROM openai_budget WHERE id = 1
      `;
      if (!row) {
        throw new Error('openai_budget row missing — run `pnpm --filter @animood/db seed:budget`');
      }
      return {
        used: row.tokens_used,
        cap: row.tokens_cap,
        remaining: Math.max(row.tokens_cap - row.tokens_used, 0),
      };
    },
  };
}
