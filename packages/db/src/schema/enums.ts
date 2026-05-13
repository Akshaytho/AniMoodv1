import { pgEnum } from 'drizzle-orm/pg-core';

export const titleType = pgEnum('title_type', [
  'anime',
  'manga',
  'manhwa',
  'manhua',
  'light_novel',
]);

export const titleStatus = pgEnum('title_status', [
  'completed',
  'ongoing',
  'hiatus',
  'cancelled',
  'announced',
]);

export const mappingType = pgEnum('mapping_type', [
  'title_emotion',
  'title_theme',
  'title_life_stage',
  'character_psychology',
  'title_similar_to',
  'character_similar_to',
  'opposes_interpretation',
  'softer_alternative_to',
  'intensity_upgrade_from',
]);

export const confidence = pgEnum('confidence_level', [
  'low',
  'medium',
  'high',
  'verified',
]);

export const mappingStatus = pgEnum('mapping_status', [
  'proposed',
  'evidence_collected',
  'human_reviewed',
  'published',
  'contested',
  'retired',
]);

export const sourceType = pgEnum('source_type', [
  'reddit',
  'mal',
  'anilist',
  'editorial',
  'seed',
]);

export const signalReviewStatus = pgEnum('signal_review_status', [
  'pending',
  'extracted',
  'discarded',
]);

export const pageDraftStatus = pgEnum('page_draft_status', [
  'pending_review',
  'review_passed',
  'review_flagged',
  'approved',
  'rejected',
]);

export const pageType = pgEnum('page_type', [
  'emotion',
  'anime',
  'manga',
  'manhwa',
  'character',
  'life_stage',
  'theme',
  'compare',
  'debate',
  'taste_profile',
  'where_to_watch',
]);

export const reviewQueueKind = pgEnum('review_queue_kind', [
  'mapping',
  'page_draft',
]);

export const workflowName = pgEnum('workflow_name', [
  'W1_title_ingestion',
  'W2_source_collection',
  'W3_ai_extraction',
  'W4_dedup_score',
  'W5_review_queue',
  'W6_db_write',
  'W7_page_draft_gen',
  'W8_seo_audit',
  'W9_publish',
]);

export const workflowStatus = pgEnum('workflow_status', [
  'running',
  'succeeded',
  'failed',
  'partial',
]);
