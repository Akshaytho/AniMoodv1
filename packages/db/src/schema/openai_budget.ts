import { pgTable, integer, timestamp, bigint } from 'drizzle-orm/pg-core';

/**
 * Singleton table. Always exactly one row with id=1.
 * `tokens_used` is atomically incremented by `packages/ai/src/budget.ts` before each OpenAI call;
 * if `tokens_used + estimate > tokens_cap`, the update is rejected and the call refused.
 *
 * Hard cap per [[animood-constraints]]: 500,000 tokens for Phase A validation.
 */
export const openaiBudget = pgTable('openai_budget', {
  id: integer('id').primaryKey(),
  tokensUsed: bigint('tokens_used', { mode: 'number' }).notNull().default(0),
  tokensCap: bigint('tokens_cap', { mode: 'number' }).notNull(),
  lastResetAt: timestamp('last_reset_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type OpenAiBudget = typeof openaiBudget.$inferSelect;
export type NewOpenAiBudget = typeof openaiBudget.$inferInsert;
