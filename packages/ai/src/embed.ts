import type { OpenAIClient } from './client';
import type { Budget } from './budget';

export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const EMBEDDING_DIMENSIONS = 1536;

export interface EmbedDeps {
  openai: OpenAIClient;
  budget: Budget;
}

export interface EmbedOutput {
  vector: number[];
  tokensUsed: number;
}

/** ~150 tokens estimate per short embed input. */
const EMBED_TOKEN_ESTIMATE = 300;

export async function embed(deps: EmbedDeps, text: string): Promise<EmbedOutput> {
  if (text.trim().length === 0) {
    throw new Error('embed: text must not be empty');
  }
  await deps.budget.reserve(EMBED_TOKEN_ESTIMATE);

  const response = await deps.openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000),
    dimensions: EMBEDDING_DIMENSIONS,
  });

  const actual = response.usage?.total_tokens ?? EMBED_TOKEN_ESTIMATE;
  await deps.budget.reconcile(EMBED_TOKEN_ESTIMATE, actual);

  const vec = response.data[0]?.embedding;
  if (!vec || vec.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `embed: expected ${EMBEDDING_DIMENSIONS}-dim vector, got ${vec?.length ?? 0}`,
    );
  }
  return { vector: vec, tokensUsed: actual };
}
