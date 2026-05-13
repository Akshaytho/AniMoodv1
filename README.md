# AniMood

Emotional anime/manga/manhwa discovery platform. Public site at [animood.app](https://animood.app).

> n8n workflows ingest public fandom discussion signals → AI extracts validated emotional patterns → human approves in a review dashboard → approved data flows to a Next.js public site.
>
> **Hard rule:** no piracy hosting, no scraped content republished, no AI-generated emotional labels without evidence.

## Spec

The single source of truth lives in `AniMood_Backend_Build_Spec.pdf` (root). Seed ontology + titles + mappings in `AniMood_Seed_Data.xlsx`.

## Stack

- pnpm workspace + Turborepo (Node 20)
- TypeScript strict
- Drizzle ORM + Postgres 16 + pgvector
- Next.js 15 + Tailwind + shadcn/ui (web + dashboard)
- n8n (9 workflows: W1–W9)
- OpenAI (extraction + nano cheap ops, embeddings)

## Layout

```
apps/
  web/            Public site — animood.app (Next.js 15, deployed to Vercel)
  dashboard/      Review dashboard UI (Next.js, deployed to Railway)
  api/            Dashboard API + n8n webhook receiver (Express, Railway)
packages/
  db/             Drizzle schema + migrations + client
  ai/             OpenAI wrapper + prompts + 500k token budget enforcer
  seo/            schema.org JSON-LD + sitemap utilities
  ui/             Shared shadcn components
n8n-workflows/    W1–W9 JSON exports (version-controlled)
docs/             ARCHITECTURE / WORKFLOWS / DATABASE / PROMPTS
scripts/          setup, seed, deploy helpers
```

## Quick start

```bash
nvm use                 # picks 20.20.1 from .nvmrc
pnpm install
cp .env.example .env    # fill DATABASE_URL and OPENAI_API_KEY at minimum
pnpm typecheck
```

## Phase 1 plan

Active execution plan: `/Users/thotaakshay/.claude/plans/read-the-pdf-inside-fuzzy-valiant.md`.

Commits 1–5 build the foundation packages (`db`, `ai`, `seo`) and the schema-on-Railway gate. Commits 6–30 follow once Phase 1 verifies.

## Constraints

- **OpenAI token cap: 500,000 tokens total** (enforced in `packages/ai`).
- Costs are in **₹ INR**, not USD.
- TypeScript strict everywhere. No `any`. No half-finished implementations.
