# @animood/db

Postgres + pgvector schema for AniMood. Drizzle ORM is the source of truth.

## Scripts

```bash
pnpm --filter @animood/db generate       # diff schema → SQL into ./migrations
pnpm --filter @animood/db migrate        # apply pending migrations to $DATABASE_URL
pnpm --filter @animood/db seed:budget    # insert the 500k token cap row (idempotent)
pnpm --filter @animood/db studio         # drizzle-kit web UI
```

## Adding / changing a column

1. Edit the relevant `src/schema/<table>.ts`.
2. `pnpm --filter @animood/db generate` — produces a new `migrations/000N_*.sql`.
3. Inspect the SQL. Hand-edit if drizzle-kit gets a type wrong (notably pgvector).
4. `pnpm --filter @animood/db migrate`.

## Notes

- `embeddings.embedding` is `vector(1536)` — matches OpenAI `text-embedding-3-small`.
- The `ivfflat` index on embeddings is created in `migrations/0001_indexes_and_triggers.sql` (drizzle-kit can't emit the `lists=100` parameter).
- `updated_at` columns are kept current by a Postgres trigger installed in migration 0001.
- `openai_budget` is a singleton row enforcing the 500k token cap. Don't truncate it.
