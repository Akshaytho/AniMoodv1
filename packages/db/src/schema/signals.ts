import { pgTable, serial, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { titles } from './titles';
import { characters } from './characters';
import { emotions } from './emotions';
import { sourceType, signalReviewStatus } from './enums';

/**
 * CRITICAL: extractedPattern MUST be the AI-paraphrased pattern, not raw source text.
 * Spec §6.5 — no raw scraping ever stored or republished.
 */
export const signals = pgTable(
  'signals',
  {
    id: serial('id').primaryKey(),
    titleId: integer('title_id').references(() => titles.id, { onDelete: 'cascade' }),
    characterId: integer('character_id').references(() => characters.id, { onDelete: 'cascade' }),
    sourceType: sourceType('source_type').notNull(),
    sourceUrl: text('source_url'),
    sourceDate: timestamp('source_date', { withTimezone: true }),
    extractedPattern: text('extracted_pattern').notNull(),
    detectedEmotionId: integer('detected_emotion_id').references(() => emotions.id),
    intensityHint: integer('intensity_hint'),
    confidenceScore: integer('confidence_score'),
    reviewedStatus: signalReviewStatus('reviewed_status').notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pendingIdx: index('idx_signals_reviewed_status').on(t.reviewedStatus),
    titleIdx: index('idx_signals_title').on(t.titleId),
  }),
);

export type Signal = typeof signals.$inferSelect;
export type NewSignal = typeof signals.$inferInsert;
