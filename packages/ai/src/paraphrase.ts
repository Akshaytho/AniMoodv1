import type { OpenAIClient } from './client';
import { resolveModel } from './client';
import type { Budget } from './budget';
import { loadPrompt, fillTemplate } from './prompts';
import { paraphraseSignalSchema, type ParaphraseSignalResult } from './schemas';
import { InvalidJsonError } from './errors';

export interface ParaphraseSignalInput {
  titleName: string;
  sourceType: string;
  sourceUrl: string;
  sourceText: string;
}

export interface ParaphraseSignalDeps {
  openai: OpenAIClient;
  budget: Budget;
}

export interface ParaphraseSignalOutput {
  result: ParaphraseSignalResult;
  tokensUsed: number;
}

/**
 * Estimate of upper-bound tokens for a paraphrase call. Conservatively chosen:
 *  - prompt (~200 tokens)
 *  - user (source text up to ~2k chars ≈ 600 tokens)
 *  - output (~120 tokens)
 */
const PARAPHRASE_TOKEN_ESTIMATE = 1000;

export async function paraphraseSignal(
  deps: ParaphraseSignalDeps,
  input: ParaphraseSignalInput,
): Promise<ParaphraseSignalOutput> {
  await deps.budget.reserve(PARAPHRASE_TOKEN_ESTIMATE);

  const prompt = loadPrompt('paraphrase-signal');
  const userMessage = fillTemplate(prompt.user, {
    titleName: input.titleName,
    sourceType: input.sourceType,
    sourceUrl: input.sourceUrl,
    sourceText: input.sourceText.slice(0, 4000),
  });

  const model = resolveModel('cheap');
  const completion = await deps.openai.chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    temperature: 0.2,
    messages: [
      { role: 'system', content: prompt.system },
      { role: 'user', content: userMessage },
    ],
  });

  const actual = completion.usage?.total_tokens ?? PARAPHRASE_TOKEN_ESTIMATE;
  await deps.budget.reconcile(PARAPHRASE_TOKEN_ESTIMATE, actual);

  const raw = completion.choices[0]?.message?.content ?? '';
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new InvalidJsonError(`paraphraseSignal: model returned non-JSON`, raw, err);
  }
  const result = paraphraseSignalSchema.safeParse(parsed);
  if (!result.success) {
    throw new InvalidJsonError(
      `paraphraseSignal: model output failed schema: ${result.error.message}`,
      raw,
    );
  }
  return { result: result.data, tokensUsed: actual };
}
