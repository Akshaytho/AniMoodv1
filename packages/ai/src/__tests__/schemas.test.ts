import { describe, it, expect } from 'vitest';
import { paraphraseSignalSchema, extractMappingsSchema } from '../schemas';

describe('paraphraseSignalSchema', () => {
  it('accepts a well-formed output', () => {
    const result = paraphraseSignalSchema.safeParse({
      pattern: 'The commenter expressed feeling deeply alone despite being surrounded.',
      emotion_signals: ['loneliness', 'rebuilding'],
      intensity_hint: 4,
      confidence_in_signal: 75,
    });
    expect(result.success).toBe(true);
  });

  it('rejects intensity outside 1-5', () => {
    const result = paraphraseSignalSchema.safeParse({
      pattern: 'x',
      emotion_signals: [],
      intensity_hint: 9,
      confidence_in_signal: 50,
    });
    expect(result.success).toBe(false);
  });

  it('allows null intensity', () => {
    const result = paraphraseSignalSchema.safeParse({
      pattern: 'x',
      emotion_signals: [],
      intensity_hint: null,
      confidence_in_signal: 0,
    });
    expect(result.success).toBe(true);
  });
});

describe('extractMappingsSchema', () => {
  it('accepts a well-formed extraction', () => {
    const result = extractMappingsSchema.safeParse({
      title_slug: 'vinland-saga',
      extracted_mappings: [
        {
          emotion: 'Loneliness',
          intensity: 4,
          evidence_notes: "Thorfinn's farm arc shows him reckoning with isolation.",
          supporting_signal_count: 5,
          confidence: 'high',
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts an empty mappings array', () => {
    const result = extractMappingsSchema.safeParse({
      title_slug: 'x',
      extracted_mappings: [],
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid confidence value', () => {
    const result = extractMappingsSchema.safeParse({
      title_slug: 'x',
      extracted_mappings: [
        {
          emotion: 'X',
          intensity: 3,
          evidence_notes: 'y',
          supporting_signal_count: 1,
          confidence: 'maybe',
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});
