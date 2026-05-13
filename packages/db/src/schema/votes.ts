import { pgTable, serial, integer, timestamp, uuid, smallint, index } from 'drizzle-orm/pg-core';
import { mappings } from './mappings';

export const votes = pgTable(
  'votes',
  {
    id: serial('id').primaryKey(),
    anonId: uuid('anon_id').notNull(),
    mappingId: integer('mapping_id')
      .notNull()
      .references(() => mappings.id, { onDelete: 'cascade' }),
    vote: smallint('vote').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    mappingIdx: index('idx_votes_mapping').on(t.mappingId),
    anonIdx: index('idx_votes_anon').on(t.anonId),
  }),
);

export type Vote = typeof votes.$inferSelect;
export type NewVote = typeof votes.$inferInsert;
