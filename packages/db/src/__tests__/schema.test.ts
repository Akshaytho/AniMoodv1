import { describe, it, expect } from 'vitest';
import {
  titles,
  emotions,
  lifeStages,
  themes,
  characterPsychologies,
  characters,
  mappings,
  signals,
  sources,
  pageDrafts,
  pages,
  userProfiles,
  votes,
  embeddings,
  workflowLogs,
  reviewQueue,
  openaiBudget,
} from '../schema/index';
import { getTableName, getTableColumns } from 'drizzle-orm';

describe('schema exports', () => {
  it('exposes all 17 expected tables with matching DB names', () => {
    const expected: Array<[unknown, string]> = [
      [titles, 'titles'],
      [emotions, 'emotions'],
      [lifeStages, 'life_stages'],
      [themes, 'themes'],
      [characterPsychologies, 'character_psychologies'],
      [characters, 'characters'],
      [mappings, 'mappings'],
      [signals, 'signals'],
      [sources, 'sources'],
      [pageDrafts, 'page_drafts'],
      [pages, 'pages'],
      [userProfiles, 'user_profiles'],
      [votes, 'votes'],
      [embeddings, 'embeddings'],
      [workflowLogs, 'workflow_logs'],
      [reviewQueue, 'review_queue'],
      [openaiBudget, 'openai_budget'],
    ];
    expect(expected.length).toBe(17);
    for (const [table, name] of expected) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(getTableName(table as any)).toBe(name);
    }
  });

  it('signals.extractedPattern is NOT NULL (paraphrase-only rule)', () => {
    const cols = getTableColumns(signals);
    expect(cols.extractedPattern.notNull).toBe(true);
  });

  it('embeddings.embedding has dimensions=1536 (matches text-embedding-3-small)', () => {
    const cols = getTableColumns(embeddings);
    // pgvector columns expose dimensions in their config
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dim = (cols.embedding as any).dimensions ?? (cols.embedding as any).config?.dimensions;
    expect(dim).toBe(1536);
  });

  it('mappings.evidenceNotes is NOT NULL (no evidenceless mappings)', () => {
    const cols = getTableColumns(mappings);
    expect(cols.evidenceNotes.notNull).toBe(true);
  });

  it('openai_budget.tokensCap is NOT NULL', () => {
    const cols = getTableColumns(openaiBudget);
    expect(cols.tokensCap.notNull).toBe(true);
  });
});
