import type { OpenAIClient } from './client';
import { resolveModel } from './client';
import type { Budget } from './budget';
import { loadPrompt, fillTemplate } from './prompts';
import { extractMappingsSchema, type ExtractMappingsResult } from './schemas';
import { InvalidJsonError } from './errors';

export interface ExtractMappingsInput {
  title: { name: string; type: string; year?: number | null; slug: string };
  signals: Array<{ sourceType: string; pattern: string }>;
  /** The allowed emotion ontology — read from the DB by the caller. */
  emotionOntology: string[];
}

export interface ExtractMappingsDeps {
  openai: OpenAIClient;
  budget: Budget;
}

export interface ExtractMappingsOutput {
  result: ExtractMappingsResult;
  tokensUsed: number;
}

/**
 * Upper-bound token estimate for an extraction call.
 *  - prompt (~400 tokens)
 *  - up to 50 signals @ ~30 tokens each = 1500
 *  - output (~600 tokens)
 */
const EXTRACT_TOKEN_ESTIMATE = 2500;

export async function extractMappings(
  deps: ExtractMappingsDeps,
  input: ExtractMappingsInput,
): Promise<ExtractMappingsOutput> {
  if (input.signals.length === 0) {
    throw new Error('extractMappings: signals[] must not be empty');
  }
  if (input.emotionOntology.length === 0) {
    throw new Error('extractMappings: emotionOntology must not be empty');
  }

  await deps.budget.reserve(EXTRACT_TOKEN_ESTIMATE);

  const prompt = loadPrompt('emotional-extraction');
  const signalsBlock = input.signals
    .map((s) => `- (${s.sourceType}) ${s.pattern}`)
    .join('\n');
  const userMessage = fillTemplate(prompt.user, {
    titleName: input.title.name,
    titleType: input.title.type,
    titleYear: input.title.year ?? '—',
    titleSlug: input.title.slug,
    signalCount: input.signals.length,
    signalsBlock,
    emotionOntology: input.emotionOntology.join(', '),
  });

  const model = resolveModel('extraction');
  const completion = await deps.openai.chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    temperature: 0.2,
    messages: [
      { role: 'system', content: prompt.system },
      { role: 'user', content: userMessage },
    ],
  });

  const actual = completion.usage?.total_tokens ?? EXTRACT_TOKEN_ESTIMATE;
  await deps.budget.reconcile(EXTRACT_TOKEN_ESTIMATE, actual);

  const raw = completion.choices[0]?.message?.content ?? '';
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new InvalidJsonError('extractMappings: model returned non-JSON', raw, err);
  }
  const result = extractMappingsSchema.safeParse(parsed);
  if (!result.success) {
    throw new InvalidJsonError(
      `extractMappings: model output failed schema: ${result.error.message}`,
      raw,
    );
  }
  return { result: result.data, tokensUsed: actual };
}
