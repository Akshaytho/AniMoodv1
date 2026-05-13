export const BANNED_ANCHORS: readonly string[] = Object.freeze([
  'click here',
  'read more',
  'this',
  'here',
  'link',
  'this article',
  'this page',
  'more info',
  'learn more',
]);

const NORMALIZE_RE = /\s+/g;

export interface AnchorTextResult {
  ok: boolean;
  reason?: string;
}

/**
 * Reject low-value anchor text. Entity SEO needs anchors that carry the
 * relationship — "Loneliness" not "click here", "Vinland Saga" not "this".
 */
export function validateAnchorText(anchor: string): AnchorTextResult {
  const cleaned = anchor.trim().toLowerCase().replace(NORMALIZE_RE, ' ');
  if (cleaned.length < 3) {
    return { ok: false, reason: `anchor too short: "${anchor}"` };
  }
  if (cleaned.length > 80) {
    return { ok: false, reason: `anchor too long: ${cleaned.length} chars` };
  }
  if (BANNED_ANCHORS.includes(cleaned)) {
    return { ok: false, reason: `anchor in banned list: "${cleaned}"` };
  }
  return { ok: true };
}
