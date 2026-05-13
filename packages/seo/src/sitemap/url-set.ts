export const MAX_URLS_PER_SET = 50_000; // sitemaps.org spec

export interface SitemapUrl {
  loc: string;
  lastmod?: string; // ISO 8601
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number; // 0.0 – 1.0
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function clampPriority(p: number): number {
  if (!Number.isFinite(p)) return 0.5;
  return Math.min(Math.max(p, 0), 1);
}

export function buildUrlSet(urls: SitemapUrl[]): string {
  if (urls.length > MAX_URLS_PER_SET) {
    throw new Error(
      `buildUrlSet: ${urls.length} URLs exceeds sitemap cap of ${MAX_URLS_PER_SET}. Split into multiple sub-sitemaps.`,
    );
  }
  const body = urls
    .map((u) => {
      const parts: string[] = [`<loc>${xmlEscape(u.loc)}</loc>`];
      if (u.lastmod) parts.push(`<lastmod>${xmlEscape(u.lastmod)}</lastmod>`);
      if (u.changefreq) parts.push(`<changefreq>${u.changefreq}</changefreq>`);
      if (u.priority !== undefined) parts.push(`<priority>${clampPriority(u.priority).toFixed(2)}</priority>`);
      return `  <url>${parts.join('')}</url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}
