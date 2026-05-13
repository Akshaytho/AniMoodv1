import { pgTable, serial, text, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { titles } from './titles';

export const characters = pgTable(
  'characters',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    externalId: text('external_id').unique(),
    name: text('name').notNull(),
    titleId: integer('title_id')
      .notNull()
      .references(() => titles.id, { onDelete: 'cascade' }),
    role: text('role'),
    psychologyIds: jsonb('psychology_ids').$type<number[]>().notNull().default([]),
    arcSummary: text('arc_summary'),
    whyConnect: text('why_connect'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    titleIdx: index('idx_characters_title').on(t.titleId),
  }),
);

export type Character = typeof characters.$inferSelect;
export type NewCharacter = typeof characters.$inferInsert;
