import { pgTable, serial, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { titleType, titleStatus } from './enums';

export const titles = pgTable(
  'titles',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    nameOriginal: text('name_original'),
    type: titleType('type').notNull(),
    status: titleStatus('status').notNull(),
    releaseYear: integer('release_year'),
    endYear: integer('end_year'),
    demographic: text('demographic'),
    description: text('description'),
    spoilerSafeSummary: text('spoiler_safe_summary'),
    emotionalPositioning: text('emotional_positioning'),
    malId: integer('mal_id').unique(),
    anilistId: integer('anilist_id').unique(),
    lastSignalCollectedAt: timestamp('last_signal_collected_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    typeIdx: index('idx_titles_type').on(t.type),
    statusIdx: index('idx_titles_status').on(t.status),
  }),
);

export type Title = typeof titles.$inferSelect;
export type NewTitle = typeof titles.$inferInsert;
