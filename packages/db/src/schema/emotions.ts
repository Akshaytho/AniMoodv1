import { pgTable, serial, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const emotions = pgTable('emotions', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  externalId: text('external_id').unique(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  definition: text('definition').notNull(),
  intensityMin: integer('intensity_min').notNull().default(1),
  intensityMax: integer('intensity_max').notNull().default(5),
  exampleQuery: text('example_query'),
  sensitive: boolean('sensitive').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Emotion = typeof emotions.$inferSelect;
export type NewEmotion = typeof emotions.$inferInsert;
