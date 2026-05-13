import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  decimal,
  index,
} from 'drizzle-orm/pg-core';
import { mappingType, confidence, mappingStatus } from './enums';

export const mappings = pgTable(
  'mappings',
  {
    id: serial('id').primaryKey(),
    type: mappingType('type').notNull(),
    sourceTable: text('source_table').notNull(),
    sourceId: integer('source_id').notNull(),
    targetTable: text('target_table').notNull(),
    targetId: integer('target_id').notNull(),
    intensity: integer('intensity'),
    evidenceNotes: text('evidence_notes').notNull(),
    evidenceCount: integer('evidence_count').notNull().default(1),
    confidence: confidence('confidence').notNull(),
    confidenceScore: decimal('confidence_score', { precision: 4, scale: 3 }),
    status: mappingStatus('status').notNull().default('proposed'),
    reviewedBy: text('reviewed_by'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusCreatedIdx: index('idx_mappings_status_created').on(t.status, t.createdAt),
    sourceIdx: index('idx_mappings_source').on(t.sourceTable, t.sourceId),
    targetIdx: index('idx_mappings_target').on(t.targetTable, t.targetId),
  }),
);

export type Mapping = typeof mappings.$inferSelect;
export type NewMapping = typeof mappings.$inferInsert;
