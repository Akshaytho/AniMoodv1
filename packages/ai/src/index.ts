export { createOpenAIClient, type OpenAIClient } from './client';
export { createBudget, BudgetExceededError, type Budget } from './budget';
export { loadPrompt, type LoadedPrompt } from './prompts';
export {
  paraphraseSignalSchema,
  extractMappingsSchema,
  type ParaphraseSignalResult,
  type ExtractMappingsResult,
} from './schemas';
export { paraphraseSignal } from './paraphrase';
export { extractMappings } from './extract';
export { generatePageDraft } from './page-draft';
export { embed, EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from './embed';
export { detectVerbatimQuote, detectGenericFluff } from './audit';
export { InvalidJsonError, ModelRefusalError } from './errors';
