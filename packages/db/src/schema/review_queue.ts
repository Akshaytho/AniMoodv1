import { pgTable, serial, integer, timestamp, text, index } from 'drizzle-orm/pg-core';
import { reviewQueueKind } from './enums';

export const reviewQueue = pgTable(
  'review_queue',
  {
    id: serial('id').primaryKey(),
    kind: reviewQueueKind('kind').notNull(),
    refId: integer('ref_id').notNull(),
    priority: integer('priority').notNull().default(0),
    claimedBy: text('claimed_by'),
    claimedAt: timestamp('claimed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    kindRefIdx: index('idx_review_queue_kind_ref').on(t.kind, t.refId),
    priorityIdx: index('idx_review_queue_priority').on(t.priority, t.createdAt),
  }),
);

export type ReviewQueueItem = typeof reviewQueue.$inferSelect;
export type NewReviewQueueItem = typeof reviewQueue.$inferInsert;
