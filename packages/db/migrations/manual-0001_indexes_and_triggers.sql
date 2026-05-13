-- =============================================================================
-- AniMood — hand-written supplementary SQL applied AFTER drizzle migrations.
-- Idempotent. Safe to re-run.
-- =============================================================================

-- pgvector similarity index (drizzle-kit can't emit `lists`)
CREATE INDEX IF NOT EXISTS idx_embeddings_vec
  ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Partial index hot path for W2 source collection
CREATE INDEX IF NOT EXISTS idx_signals_pending
  ON signals (reviewed_status) WHERE reviewed_status = 'pending';

-- Hot path: titles needing fresh signals
CREATE INDEX IF NOT EXISTS idx_titles_last_signal
  ON titles (last_signal_collected_at NULLS FIRST);

-- updated_at trigger function (Postgres has no native onupdate)
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger
  LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Install trigger on every table with an `updated_at` column.
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'titles',
    'emotions',
    'life_stages',
    'themes',
    'character_psychologies',
    'characters',
    'mappings',
    'pages',
    'page_drafts',
    'openai_budget'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%I_updated ON %I; CREATE TRIGGER trg_%I_updated BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
      t, t, t, t
    );
  END LOOP;
END;
$$;
