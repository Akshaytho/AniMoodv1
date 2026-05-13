# @animood/ai

OpenAI wrappers, prompts, and a hard 500k token budget enforcer.

## What's here

- `client.ts` — OpenAI client factory + `resolveModel('extraction'|'cheap')`.
- `budget.ts` — atomic Postgres-backed token counter. Every call reserves before, reconciles after. Throws `BudgetExceededError` if the cap would be exceeded.
- `prompts.ts` — loads `.md` prompt files split into `SYSTEM:` and `USER:` blocks; `fillTemplate` substitutes `{{placeholders}}` (throws on unmatched).
- `schemas.ts` — Zod schemas for every JSON output.
- `paraphrase.ts` (W2) — paraphrases a public comment.
- `extract.ts` (W3) — extracts emotional mappings for a title from N signals.
- `page-draft.ts` (W7) — generates a markdown page draft.
- `embed.ts` (W6) — 1536-dim embeddings via `text-embedding-3-small`.
- `audit.ts` (W8) — JS heuristics: verbatim-quote detection, generic-fluff detection.

## Budget semantics

```
reserve(N)        atomic UPDATE that only commits if (used + N) <= cap
                  throws BudgetExceededError otherwise
reconcile(est,act) credits or debits the difference
status()           returns { used, cap, remaining }
```

The budget row is seeded once via `pnpm --filter @animood/db seed:budget` (default cap 500_000, override with `OPENAI_TOKEN_BUDGET`).

## Smoke test

```
pnpm --filter @animood/ai smoke
```

Makes one real `paraphraseSignal` call against `OPENAI_MODEL_CHEAP`. Costs ~500 tokens. Prints budget before/after.

## Adding a new prompt

1. Drop `prompts/<name>.md` with `SYSTEM:` and `USER:` blocks.
2. Add `<name>` to the `PromptName` union in `prompts.ts`.
3. Add a Zod schema in `schemas.ts`.
4. Add a wrapper function (estimate tokens, reserve, call, reconcile, parse, validate).
