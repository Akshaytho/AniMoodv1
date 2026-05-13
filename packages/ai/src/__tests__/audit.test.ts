import { describe, it, expect } from 'vitest';
import { detectVerbatimQuote, detectGenericFluff } from '../audit';

describe('detectVerbatimQuote', () => {
  it('flags a 15-word verbatim span', () => {
    const source =
      'the quick brown fox jumps over the lazy dog every single afternoon in this town and twice on sunday';
    const text = `Some preamble. ${source} More preamble.`;
    const res = detectVerbatimQuote(text, [source], 15);
    expect(res.found).toBe(true);
    expect(res.longestRun).toBeGreaterThanOrEqual(15);
  });

  it('passes when only short overlaps exist', () => {
    const text = 'we connect with characters who carry guilt across years of silence and grief';
    const sources = ['guilt across years of silence and grief is something many fans note'];
    const res = detectVerbatimQuote(text, sources, 15);
    expect(res.found).toBe(false);
  });
});

describe('detectGenericFluff', () => {
  it('flags 2+ filler markers', () => {
    const text = 'In conclusion, this is a must-watch series that dives into emotional themes.';
    const res = detectGenericFluff(text);
    expect(res.flagged).toBe(true);
    expect(res.flags.length).toBeGreaterThanOrEqual(2);
  });

  it('does not flag clean copy', () => {
    const text =
      "Many viewers connect with Thorfinn's slow rebuilding after years of revenge fail to bring peace.";
    const res = detectGenericFluff(text);
    expect(res.flagged).toBe(false);
  });
});
