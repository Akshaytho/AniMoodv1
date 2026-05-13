import { pgTable, serial, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { pageType } from './enums';

export const pages = pgTable(
  'pages',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    pageType: pageType('page_type').notNull(),
    title: text('title').notNull(),
    markdown: text('markdown').notNull(),
    schemaJsonld: jsonb('schema_jsonld').notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    typeIdx: index('idx_pages_type').on(t.pageType),
  }),
);

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
