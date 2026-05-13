#!/usr/bin/env bash
# Post-migration sanity check. Exits non-zero on any failure.
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  if [ -f .env ]; then
    set -a
    # shellcheck disable=SC1091
    . .env
    set +a
  fi
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set (no .env either). Aborting." >&2
  exit 1
fi

run() {
  local label="$1"
  local expected="$2"
  local query="$3"
  local actual
  actual=$(psql "$DATABASE_URL" -tAc "$query" | tr -d '[:space:]')
  if [ "$actual" = "$expected" ]; then
    printf "  ✓ %s = %s\n" "$label" "$actual"
  else
    printf "  ✗ %s = %s (expected %s)\n" "$label" "$actual" "$expected" >&2
    exit 1
  fi
}

echo "[db-verify] running checks against \$DATABASE_URL..."

run "pgvector extension" "vector" \
  "SELECT extname FROM pg_extension WHERE extname='vector'"

run "tables in public schema (>=17)" "17" \
  "SELECT GREATEST(COUNT(*),17) FROM information_schema.tables WHERE table_schema='public' AND table_name NOT LIKE '\\_\\_drizzle%'"

run "openai_budget singleton" "500000" \
  "SELECT tokens_cap FROM openai_budget WHERE id=1"

run "embeddings ivfflat index" "idx_embeddings_vec" \
  "SELECT indexname FROM pg_indexes WHERE indexname='idx_embeddings_vec'"

run "updated_at trigger on titles" "trg_titles_updated" \
  "SELECT tgname FROM pg_trigger WHERE tgname='trg_titles_updated'"

echo "[db-verify] all checks passed."
