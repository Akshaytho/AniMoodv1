import { describe, it, expect } from 'vitest';
import { loadPrompt, fillTemplate, type PromptName } from '../prompts';

describe('loadPrompt', () => {
  const names: PromptName[] = [
    'paraphrase-signal',
    'emotional-extraction',
    'page-draft-generation',
  ];

  for (const name of names) {
    it(`loads ${name} with non-empty system + user blocks`, () => {
      const p = loadPrompt(name);
      expect(p.name).toBe(name);
      expect(p.system.length).toBeGreaterThan(20);
      expect(p.user.length).toBeGreaterThan(20);
      expect(p.system.toLowerCase()).not.toContain('user:');
      expect(p.user.toLowerCase()).not.toContain('system:');
    });
  }

  it('paraphrase-signal forbids quoting in its system prompt', () => {
    const p = loadPrompt('paraphrase-signal');
    expect(p.system.toLowerCase()).toContain('never quote');
  });

  it('emotional-extraction enforces the 2+ signal evidence rule', () => {
    const p = loadPrompt('emotional-extraction');
    expect(p.system).toMatch(/2\+ independent signals/);
  });
});

describe('fillTemplate', () => {
  it('substitutes simple placeholders', () => {
    expect(fillTemplate('hi {{name}}', { name: 'Thorfinn' })).toBe('hi Thorfinn');
  });

  it('throws on unmatched placeholders', () => {
    expect(() => fillTemplate('hi {{missing}}', { name: 'x' })).toThrow(/missing/);
  });

  it('coerces numbers', () => {
    expect(fillTemplate('{{n}} signals', { n: 42 })).toBe('42 signals');
  });
});
