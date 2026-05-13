import OpenAI from 'openai';

export type OpenAIClient = OpenAI;

export interface CreateOpenAIClientOptions {
  apiKey?: string;
  baseURL?: string;
}

export function createOpenAIClient(opts: CreateOpenAIClientOptions = {}): OpenAIClient {
  const apiKey = opts.apiKey ?? process.env['OPENAI_API_KEY'];
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  return new OpenAI({
    apiKey,
    baseURL: opts.baseURL,
  });
}

/**
 * Resolve a model ID at call time (not module load time) so a hot
 * env-var change in dev doesn't require restarting.
 */
export function resolveModel(kind: 'extraction' | 'cheap'): string {
  const key = kind === 'extraction' ? 'OPENAI_MODEL_EXTRACTION' : 'OPENAI_MODEL_CHEAP';
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`${key} is not set`);
  }
  return value;
}
