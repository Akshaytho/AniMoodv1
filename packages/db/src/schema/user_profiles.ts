import { pgTable, serial, text, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core';

export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  anonId: uuid('anon_id').notNull().unique().defaultRandom(),
  tasteVector: jsonb('taste_vector').$type<Record<string, number>>().notNull().default({}),
  preferredTitleTypes: jsonb('preferred_title_types').$type<string[]>().notNull().default([]),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
