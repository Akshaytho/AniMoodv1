import { pgTable, serial, text, timestamp, index } from 'drizzle-orm/pg-core';
import { sourceType } from './enums';

/**
 * Origin metadata only — we never store the original text body.
 * `hash` is sha256 of the original text used for dedup before paraphrasing.
 */
export const sources = pgTable(
  'sources',
  {
    id: serial('id').primaryKey(),
    type: sourceType('type').notNull(),
    url: text('url').notNull(),
    hash: text('hash').notNull().unique(),
    retrievedAt: timestamp('retrieved_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    typeIdx: index('idx_sources_type').on(t.type),
  }),
);

export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
