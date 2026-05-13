import type { OpenAIClient } from './client';
import { resolveModel } from './client';
import type { Budget } from './budget';
import { loadPrompt, fillTemplate } from './prompts';

export interface PageDraftInput {
  pageType: string;
  templateName: string;
  entityName: string;
  dataJson: unknown;
}

export interface PageDraftDeps {
  openai: OpenAIClient;
  budget: Budget;
}

export interface PageDraftOutput {
  markdown: string;
  tokensUsed: number;
}

/**
 * Upper-bound estimate:
 *  - prompt + data (~1500 tokens)
 *  - output (~1800 tokens for a 1500-word draft)
 */
const PAGE_DRAFT_TOKEN_ESTIMATE = 3500;

export async function generatePageDraft(
  deps: PageDraftDeps,
  input: PageDraftInput,
): Promise<PageDraftOutput> {
  await deps.budget.reserve(PAGE_DRAFT_TOKEN_ESTIMATE);

  const prompt = loadPrompt('page-draft-generation');
  const userMessage = fillTemplate(prompt.user, {
    pageType: input.pageType,
    templateName: input.templateName,
    entityName: input.entityName,
    dataJson: JSON.stringify(input.dataJson, null, 2),
  });

  const model = resolveModel('extraction');
  const completion = await deps.openai.chat.completions.create({
    model,
    temperature: 0.4,
    messages: [
      { role: 'system', content: prompt.system },
      { role: 'user', content: userMessage },
    ],
  });

  const actual = completion.usage?.total_tokens ?? PAGE_DRAFT_TOKEN_ESTIMATE;
  await deps.budget.reconcile(PAGE_DRAFT_TOKEN_ESTIMATE, actual);

  const markdown = completion.choices[0]?.message?.content?.trim() ?? '';
  if (markdown.length === 0) {
    throw new Error('generatePageDraft: model returned empty content');
  }
  return { markdown, tokensUsed: actual };
}
