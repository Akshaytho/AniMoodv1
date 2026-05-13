CREATE TYPE "public"."confidence_level" AS ENUM('low', 'medium', 'high', 'verified');--> statement-breakpoint
CREATE TYPE "public"."mapping_status" AS ENUM('proposed', 'evidence_collected', 'human_reviewed', 'published', 'contested', 'retired');--> statement-breakpoint
CREATE TYPE "public"."mapping_type" AS ENUM('title_emotion', 'title_theme', 'title_life_stage', 'character_psychology', 'title_similar_to', 'character_similar_to', 'opposes_interpretation', 'softer_alternative_to', 'intensity_upgrade_from');--> statement-breakpoint
CREATE TYPE "public"."page_draft_status" AS ENUM('pending_review', 'review_passed', 'review_flagged', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."page_type" AS ENUM('emotion', 'anime', 'manga', 'manhwa', 'character', 'life_stage', 'theme', 'compare', 'debate', 'taste_profile', 'where_to_watch');--> statement-breakpoint
CREATE TYPE "public"."review_queue_kind" AS ENUM('mapping', 'page_draft');--> statement-breakpoint
CREATE TYPE "public"."signal_review_status" AS ENUM('pending', 'extracted', 'discarded');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('reddit', 'mal', 'anilist', 'editorial', 'seed');--> statement-breakpoint
CREATE TYPE "public"."title_status" AS ENUM('completed', 'ongoing', 'hiatus', 'cancelled', 'announced');--> statement-breakpoint
CREATE TYPE "public"."title_type" AS ENUM('anime', 'manga', 'manhwa', 'manhua', 'light_novel');--> statement-breakpoint
CREATE TYPE "public"."workflow_name" AS ENUM('W1_title_ingestion', 'W2_source_collection', 'W3_ai_extraction', 'W4_dedup_score', 'W5_review_queue', 'W6_db_write', 'W7_page_draft_gen', 'W8_seo_audit', 'W9_publish');--> statement-breakpoint
CREATE TYPE "public"."workflow_status" AS ENUM('running', 'succeeded', 'failed', 'partial');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "titles" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"name_original" text,
	"type" "title_type" NOT NULL,
	"status" "title_status" NOT NULL,
	"release_year" integer,
	"end_year" integer,
	"demographic" text,
	"description" text,
	"spoiler_safe_summary" text,
	"emotional_positioning" text,
	"mal_id" integer,
	"anilist_id" integer,
	"last_signal_collected_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "titles_slug_unique" UNIQUE("slug"),
	CONSTRAINT "titles_mal_id_unique" UNIQUE("mal_id"),
	CONSTRAINT "titles_anilist_id_unique" UNIQUE("anilist_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "emotions" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"external_id" text,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"definition" text NOT NULL,
	"intensity_min" integer DEFAULT 1 NOT NULL,
	"intensity_max" integer DEFAULT 5 NOT NULL,
	"example_query" text,
	"sensitive" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "emotions_slug_unique" UNIQUE("slug"),
	CONSTRAINT "emotions_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "life_stages" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"external_id" text,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"sensitive" boolean DEFAULT false NOT NULL,
	"example_query" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "life_stages_slug_unique" UNIQUE("slug"),
	CONSTRAINT "life_stages_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "themes" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "themes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "character_psychologies" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"external_id" text,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "character_psychologies_slug_unique" UNIQUE("slug"),
	CONSTRAINT "character_psychologies_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "characters" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"external_id" text,
	"name" text NOT NULL,
	"title_id" integer NOT NULL,
	"role" text,
	"psychology_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"arc_summary" text,
	"why_connect" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "characters_slug_unique" UNIQUE("slug"),
	CONSTRAINT "characters_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mappings" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "mapping_type" NOT NULL,
	"source_table" text NOT NULL,
	"source_id" integer NOT NULL,
	"target_table" text NOT NULL,
	"target_id" integer NOT NULL,
	"intensity" integer,
	"evidence_notes" text NOT NULL,
	"evidence_count" integer DEFAULT 1 NOT NULL,
	"confidence" "confidence_level" NOT NULL,
	"confidence_score" numeric(4, 3),
	"status" "mapping_status" DEFAULT 'proposed' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "signals" (
	"id" serial PRIMARY KEY NOT NULL,
	"title_id" integer,
	"character_id" integer,
	"source_type" "source_type" NOT NULL,
	"source_url" text,
	"source_date" timestamp with time zone,
	"extracted_pattern" text NOT NULL,
	"detected_emotion_id" integer,
	"intensity_hint" integer,
	"confidence_score" integer,
	"reviewed_status" "signal_review_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "source_type" NOT NULL,
	"url" text NOT NULL,
	"hash" text NOT NULL,
	"retrieved_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sources_hash_unique" UNIQUE("hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_type" "page_type" NOT NULL,
	"entity_slug" text NOT NULL,
	"title" text NOT NULL,
	"markdown" text NOT NULL,
	"schema_jsonld" jsonb NOT NULL,
	"internal_links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "page_draft_status" DEFAULT 'pending_review' NOT NULL,
	"review_flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"word_count" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"page_type" "page_type" NOT NULL,
	"title" text NOT NULL,
	"markdown" text NOT NULL,
	"schema_jsonld" jsonb NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"anon_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"taste_vector" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"preferred_title_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_anon_id_unique" UNIQUE("anon_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"anon_id" uuid NOT NULL,
	"mapping_id" integer NOT NULL,
	"vote" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_table" text NOT NULL,
	"entity_id" integer NOT NULL,
	"text_source" text NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"workflow_name" "workflow_name" NOT NULL,
	"run_id" text NOT NULL,
	"status" "workflow_status" NOT NULL,
	"error" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"items_processed" integer DEFAULT 0 NOT NULL,
	"tokens_used" integer DEFAULT 0 NOT NULL,
	"cost_inr" numeric(10, 4),
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "review_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" "review_queue_kind" NOT NULL,
	"ref_id" integer NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"claimed_by" text,
	"claimed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "openai_budget" (
	"id" integer PRIMARY KEY NOT NULL,
	"tokens_used" bigint DEFAULT 0 NOT NULL,
	"tokens_cap" bigint NOT NULL,
	"last_reset_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "characters" ADD CONSTRAINT "characters_title_id_titles_id_fk" FOREIGN KEY ("title_id") REFERENCES "public"."titles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "signals" ADD CONSTRAINT "signals_title_id_titles_id_fk" FOREIGN KEY ("title_id") REFERENCES "public"."titles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "signals" ADD CONSTRAINT "signals_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "signals" ADD CONSTRAINT "signals_detected_emotion_id_emotions_id_fk" FOREIGN KEY ("detected_emotion_id") REFERENCES "public"."emotions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_mapping_id_mappings_id_fk" FOREIGN KEY ("mapping_id") REFERENCES "public"."mappings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_titles_type" ON "titles" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_titles_status" ON "titles" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_characters_title" ON "characters" USING btree ("title_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mappings_status_created" ON "mappings" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mappings_source" ON "mappings" USING btree ("source_table","source_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mappings_target" ON "mappings" USING btree ("target_table","target_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_signals_reviewed_status" ON "signals" USING btree ("reviewed_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_signals_title" ON "signals" USING btree ("title_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sources_type" ON "sources" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_page_drafts_status" ON "page_drafts" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_page_drafts_entity" ON "page_drafts" USING btree ("page_type","entity_slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pages_type" ON "pages" USING btree ("page_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_votes_mapping" ON "votes" USING btree ("mapping_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_votes_anon" ON "votes" USING btree ("anon_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_embeddings_entity" ON "embeddings" USING btree ("entity_table","entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_workflow_logs_name_started" ON "workflow_logs" USING btree ("workflow_name","started_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_review_queue_kind_ref" ON "review_queue" USING btree ("kind","ref_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_review_queue_priority" ON "review_queue" USING btree ("priority","created_at");