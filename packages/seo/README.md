# @animood/seo

Pure utilities for schema.org JSON-LD, sitemaps, and internal-link enforcement. Zero IO, zero side effects — easy to test, easy to consume from `apps/web`.

## Modules

- **`sitemap/routes`** — `toEntityUrl({ kind, slug, baseUrl })`. The **only** place that constructs entity URLs. Throws on invalid slugs.
- **`jsonld/`** — builders that return plain JS objects (serialize where you need them):
  - `buildTVSeries` — `/anime/[slug]`
  - `buildCreativeWorkSeries` — `/manga/[slug]`, `/manhwa/[slug]`
  - `buildPerson` — `/character/[slug]`
  - `buildThing` — `/emotion/[slug]`, `/theme/[slug]`, `/life-stage/[slug]`
  - `buildBreadcrumbList`, `buildWebSite`
- **`sitemap/url-set`** — `buildUrlSet(urls[])` → `<urlset>` XML. Throws past 50,000 URLs.
- **`sitemap/index-xml`** — `buildSitemapIndex(children[])` → `<sitemapindex>` XML.
- **`internal-links/rules`** — `enforceLinkBudget(links)` → `{ ok, missing }`. Enforces spec §11.2 minimums (2 emotion, 3 title, 1 life-stage, 1 character/debate where applicable, 5 internal + 2 external aggregate).
- **`internal-links/anchor-text`** — `validateAnchorText(anchor)` rejects "click here", "this", etc.
