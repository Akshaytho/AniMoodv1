import type { EntityKind } from '../sitemap/routes';

export interface InternalLink {
  kind: EntityKind | 'external';
  slug?: string;
  anchor: string;
  url: string;
}

/**
 * A rule that says: among the union of `kinds`, the total link count must be
 * ≥ `min`. `optional: true` skips the rule when none of the kinds are
 * available in the page's context.
 */
export interface LinkBudgetRule {
  kinds: ReadonlyArray<EntityKind | 'external'>;
  min: number;
  optional?: boolean;
  label: string;
}

/**
 * Spec §11.2 minimums:
 *   2+ emotion links
 *   3+ title links (anime/manga/manhwa combined)
 *   1+ life-stage link
 *   1+ character link (optional — only when page references characters)
 *   1+ debate link (optional — only when an opinion-spectrum page exists)
 *   5+ internal links total
 *   2+ outbound official links
 */
export const DEFAULT_LINK_RULES: readonly LinkBudgetRule[] = Object.freeze([
  { kinds: ['emotion'], min: 2, label: 'emotion links' },
  { kinds: ['anime', 'manga', 'manhwa'], min: 3, label: 'title links (anime/manga/manhwa)' },
  { kinds: ['life-stage'], min: 1, label: 'life-stage link' },
  { kinds: ['character'], min: 1, optional: true, label: 'character link' },
  { kinds: ['debate'], min: 1, optional: true, label: 'debate link' },
  { kinds: ['external'], min: 2, label: 'outbound official links' },
]);

export interface LinkBudgetMiss {
  label: string;
  kinds: ReadonlyArray<EntityKind | 'external'>;
  needed: number;
  have: number;
}

export interface LinkBudgetResult {
  ok: boolean;
  totalInternal: number;
  totalExternal: number;
  missing: LinkBudgetMiss[];
}

const INTERNAL_KINDS: ReadonlySet<EntityKind | 'external'> = new Set([
  'emotion',
  'anime',
  'manga',
  'manhwa',
  'character',
  'life-stage',
  'theme',
  'compare',
  'debate',
  'taste-profile',
  'where-to-watch',
]);

export function enforceLinkBudget(
  links: InternalLink[],
  rules: readonly LinkBudgetRule[] = DEFAULT_LINK_RULES,
  /** Kinds that the page's data actually supports linking to. Used to skip optional rules. */
  availableRelations?: ReadonlySet<EntityKind | 'external'>,
): LinkBudgetResult {
  const present = availableRelations ?? new Set(links.map((l) => l.kind));
  const counts = new Map<EntityKind | 'external', number>();
  for (const l of links) counts.set(l.kind, (counts.get(l.kind) ?? 0) + 1);

  const missing: LinkBudgetMiss[] = [];
  for (const rule of rules) {
    if (rule.optional && !rule.kinds.some((k) => present.has(k))) continue;
    const have = rule.kinds.reduce((sum, k) => sum + (counts.get(k) ?? 0), 0);
    if (have < rule.min) {
      missing.push({ label: rule.label, kinds: rule.kinds, needed: rule.min, have });
    }
  }

  const totalInternal = links.filter((l) => INTERNAL_KINDS.has(l.kind)).length;
  const totalExternal = links.filter((l) => l.kind === 'external').length;

  if (totalInternal < 5) {
    missing.push({ label: 'internal links total', kinds: [...INTERNAL_KINDS], needed: 5, have: totalInternal });
  }

  return {
    ok: missing.length === 0,
    totalInternal,
    totalExternal,
    missing,
  };
}
