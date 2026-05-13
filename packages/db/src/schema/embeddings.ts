import { pgTable, serial, text, integer, timestamp, vector, index } from 'drizzle-orm/pg-core';

/**
 * pgvector embeddings. Dimensions: 1536 matches `text-embedding-3-small`.
 * The ivfflat index is created in migration 0001 (drizzle-kit cannot emit it
 * with the `lists` parameter we need).
 */
export const embeddings = pgTable(
  'embeddings',
  {
    id: serial('id').primaryKey(),
    entityTable: text('entity_table').notNull(),
    entityId: integer('entity_id').notNull(),
    textSource: text('text_source').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    entityIdx: index('idx_embeddings_entity').on(t.entityTable, t.entityId),
  }),
);

export type Embedding = typeof embeddings.$inferSelect;
export type NewEmbedding = typeof embeddings.$inferInsert;
