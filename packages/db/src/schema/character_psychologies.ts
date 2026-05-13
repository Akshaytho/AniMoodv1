import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const characterPsychologies = pgTable('character_psychologies', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  externalId: text('external_id').unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type CharacterPsychology = typeof characterPsychologies.$inferSelect;
export type NewCharacterPsychology = typeof characterPsychologies.$inferInsert;
