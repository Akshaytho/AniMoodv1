export interface SitemapIndexChild {
  loc: string;
  lastmod?: string;
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildSitemapIndex(children: SitemapIndexChild[]): string {
  if (children.length === 0) {
    throw new Error('buildSitemapIndex: at least one child sitemap required');
  }
  const body = children
    .map((c) => {
      const parts = [`<loc>${xmlEscape(c.loc)}</loc>`];
      if (c.lastmod) parts.push(`<lastmod>${xmlEscape(c.lastmod)}</lastmod>`);
      return `  <sitemap>${parts.join('')}</sitemap>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}
