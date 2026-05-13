import { pgTable, serial, text, integer, timestamp, jsonb, decimal, index } from 'drizzle-orm/pg-core';
import { workflowName, workflowStatus } from './enums';

export const workflowLogs = pgTable(
  'workflow_logs',
  {
    id: serial('id').primaryKey(),
    workflowName: workflowName('workflow_name').notNull(),
    runId: text('run_id').notNull(),
    status: workflowStatus('status').notNull(),
    error: text('error'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
    itemsProcessed: integer('items_processed').notNull().default(0),
    tokensUsed: integer('tokens_used').notNull().default(0),
    costInr: decimal('cost_inr', { precision: 10, scale: 4 }),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
  },
  (t) => ({
    nameStartedIdx: index('idx_workflow_logs_name_started').on(t.workflowName, t.startedAt),
  }),
);

export type WorkflowLog = typeof workflowLogs.$inferSelect;
export type NewWorkflowLog = typeof workflowLogs.$inferInsert;
