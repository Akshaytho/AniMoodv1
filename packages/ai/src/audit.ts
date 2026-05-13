/**
 * Plain JS heuristics used by the SEO audit step (W8). Cheap, deterministic,
 * no OpenAI call required.
 */

const NORMALIZE_RE = /[^a-z0-9\s]/g;

function tokenize(s: string): string[] {
  return s.toLowerCase().replace(NORMALIZE_RE, ' ').split(/\s+/).filter(Boolean);
}

/**
 * Detects whether `text` contains any ≥`minRun` consecutive-word span that
 * appears verbatim in any of `sources`. Returns the longest match found, if any.
 */
export function detectVerbatimQuote(
  text: string,
  sources: string[],
  minRun = 15,
): { found: boolean; longestRun: number; match?: string } {
  const textTokens = tokenize(text);
  let longest = 0;
  let bestMatch: string | undefined;

  for (const source of sources) {
    const srcTokens = tokenize(source);
    if (srcTokens.length < minRun || textTokens.length < minRun) continue;

    for (let i = 0; i <= textTokens.length - minRun; i++) {
      const window = textTokens.slice(i, i + minRun).join(' ');
      const sourceJoined = srcTokens.join(' ');
      if (sourceJoined.includes(window)) {
        // Try to extend the window to find the longest run from this start.
        let runLen = minRun;
        while (
          i + runLen < textTokens.length &&
          sourceJoined.includes(textTokens.slice(i, i + runLen + 1).join(' '))
        ) {
          runLen++;
        }
        if (runLen > longest) {
          longest = runLen;
          bestMatch = textTokens.slice(i, i + runLen).join(' ');
        }
      }
    }
  }

  return { found: longest >= minRun, longestRun: longest, ...(bestMatch ? { match: bestMatch } : {}) };
}

const FLUFF_MARKERS = [
  'in conclusion',
  'in summary',
  'it is important to note',
  'in this article',
  'this article will',
  'embark on a journey',
  'dive into',
  'in the world of',
  'a must-watch',
  'mind-blowing',
];

/**
 * Returns markers from `FLUFF_MARKERS` that appear in `text` (case-insensitive).
 * A draft is "flagged" if 2 or more markers appear.
 */
export function detectGenericFluff(text: string): { flags: string[]; flagged: boolean } {
  const lower = text.toLowerCase();
  const flags = FLUFF_MARKERS.filter((m) => lower.includes(m));
  return { flags, flagged: flags.length >= 2 };
}
