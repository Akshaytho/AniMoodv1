import { pgTable, serial, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { pageType, pageDraftStatus } from './enums';

export const pageDrafts = pgTable(
  'page_drafts',
  {
    id: serial('id').primaryKey(),
    pageType: pageType('page_type').notNull(),
    entitySlug: text('entity_slug').notNull(),
    title: text('title').notNull(),
    markdown: text('markdown').notNull(),
    schemaJsonld: jsonb('schema_jsonld').notNull(),
    internalLinks: jsonb('internal_links').$type<Array<{ kind: string; slug: string; anchor: string }>>().notNull().default([]),
    status: pageDraftStatus('status').notNull().default('pending_review'),
    reviewFlags: jsonb('review_flags').$type<string[]>().notNull().default([]),
    wordCount: text('word_count'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusIdx: index('idx_page_drafts_status').on(t.status),
    entityIdx: index('idx_page_drafts_entity').on(t.pageType, t.entitySlug),
  }),
);

export type PageDraft = typeof pageDrafts.$inferSelect;
export type NewPageDraft = typeof pageDrafts.$inferInsert;
