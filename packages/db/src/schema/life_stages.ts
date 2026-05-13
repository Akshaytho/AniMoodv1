import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const lifeStages = pgTable('life_stages', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  externalId: text('external_id').unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  sensitive: boolean('sensitive').notNull().default(false),
  exampleQuery: text('example_query'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type LifeStage = typeof lifeStages.$inferSelect;
export type NewLifeStage = typeof lifeStages.$inferInsert;
