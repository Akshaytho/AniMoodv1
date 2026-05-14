import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  AppShell,
  RightRailEmotionalProfile,
  RightRailTrendingThisWeek,
} from '@/components/AppShell';
import { Stub } from '@/components/Stub';
import { EmotionImpactBars } from '@/components/EmotionImpactBars';
import { getTitleBySlug, getCharactersForTitle, getSimilarTitles } from '@/lib/queries';
import { resolvePoster } from '@/lib/poster-url';
import { resolveAnime, humanize } from '@/lib/seed-lookup';
import { buildTVSeries } from '@animood/seo';

/**
 * Emotion-slug-style key for Tailwind classes. Maps our seeded emotion names
 * to the design-token palette keys in packages/config.
 */
const EMOTION_COLOR_KEY: Record<string, string> = {
  Loneliness: 'loneliness',
  Healing: 'healing',
  Revenge: 'revenge',
  Redemption: 'redemption',
  Ambition: 'ambition',
  Grief: 'grief',
  Hope: 'hope',
  'Existential dread': 'existential',
  'Peaceful comfort': 'peace',
  'Emotional devastation': 'devastation',
  'Identity crisis': 'identity',
  'Moral ambiguity': 'moral',
  Burnout: 'burnout',
  Rebuilding: 'rebuilding',
  Nostalgia: 'nostalgia',
  Freedom: 'freedom',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title = await getTitleBySlug(slug).catch(() => null);
  if (!title) {
    return { title: humanize(slug) };
  }
  return {
    title: title.name,
    description: title.spoilerSafeSummary ?? title.emotionalPositioning ?? undefined,
    alternates: { canonical: `/anime/${slug}` },
  };
}

export default async function AnimeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getTitleBySlug(slug).catch(() => null);

  // Fallback: title not in DB → show enriched stub
  if (!data) {
    const seed = resolveAnime(slug);
    return (
      <Stub
        title={seed?.name ?? humanize(slug)}
        description="This title isn't in the AniMood database yet. Once n8n's ingestion (W1) runs against AniList + MAL, every requested title will resolve here."
        upcomingIn="ingestion pending"
        currentPath="/anime"
        resolvedMeta={seed?.meta ? [{ label: 'Type', value: seed.meta }] : []}
      />
    );
  }

  const [chars, similar] = await Promise.all([
    getCharactersForTitle(data.id),
    getSimilarTitles(data.id, 6),
  ]);

  const poster = resolvePoster(data);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://animood.app';
  const jsonLd = buildTVSeries({
    baseUrl,
    slug,
    name: data.name,
    ...(data.spoilerSafeSummary ? { description: data.spoilerSafeSummary } : { description: data.name }),
    ...(data.releaseYear !== null && data.releaseYear !== undefined
      ? { datePublished: `${data.releaseYear}-01-01` }
      : {}),
    characters: chars.map((c) => ({ kind: 'character' as const, slug: c.slug, name: c.name })),
    relatedTitles: similar.map((s) => ({
      kind: s.title.type === 'manga' || s.title.type === 'manhwa'
        ? (s.title.type as 'manga' | 'manhwa')
        : ('anime' as const),
      slug: s.title.slug,
      name: s.title.name,
    })),
    emotions: data.topEmotions.slice(0, 5).map((e) => ({
      kind: 'emotion' as const,
      slug: e.emotion.slug,
      name: e.emotion.name,
    })),
  });

  const impactRows = data.topEmotions.slice(0, 6).map((e) => ({
    name: e.emotion.name,
    intensity: e.intensity,
    confidence: e.confidence,
    ...(EMOTION_COLOR_KEY[e.emotion.name]
      ? { colorKey: EMOTION_COLOR_KEY[e.emotion.name] }
      : {}),
  }));

  return (
    <AppShell
      currentPath="/anime"
      rightRail={
        <>
          <section className="lift-card p-4">
            <h3 className="text-[13px] font-semibold mb-3">Emotional Impact</h3>
            <EmotionImpactBars rows={impactRows} />
          </section>
          <RightRailEmotionalProfile />
          <RightRailTrendingThisWeek />
        </>
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="grid md:grid-cols-[220px_1fr] gap-5">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-2 ring-1 ring-border max-w-[220px]">
          {poster ? (
            <Image
              src={poster}
              alt={`${data.name} poster`}
              fill
              sizes="220px"
              priority
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-faint text-xs">
              No poster
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2 text-[12px] text-muted">
            <span className="px-2 py-0.5 rounded bg-surface-2 border border-border uppercase tracking-wider text-[10px]">
              {data.type}
            </span>
            {data.releaseYear && <span>{data.releaseYear}</span>}
            {data.demographic && <span>· {data.demographic}</span>}
            <span>·</span>
            <span className="capitalize">{data.status.replace('_', ' ')}</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight">
            {data.name}
          </h1>
          {data.nameOriginal && (
            <p className="text-muted text-sm mt-0.5">{data.nameOriginal}</p>
          )}
          {data.emotionalPositioning && (
            <blockquote className="mt-4 border-l-2 border-accent pl-3 text-text/90 italic text-md leading-relaxed max-w-2xl">
              {data.emotionalPositioning}
            </blockquote>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            {data.topEmotions.slice(0, 4).map((e) => {
              const colorKey = EMOTION_COLOR_KEY[e.emotion.name];
              const cls = colorKey
                ? `bg-emotion-${colorKey}/10 text-emotion-${colorKey} border-emotion-${colorKey}/30`
                : 'bg-surface-2 text-muted border-border';
              return (
                <Link
                  key={e.emotion.id}
                  href={`/emotion/${e.emotion.slug}`}
                  className={`px-2.5 py-1 rounded-pill text-[12px] font-medium border ${cls} hover:opacity-90`}
                >
                  {e.emotion.name}
                  {e.intensity !== null && (
                    <span className="ml-1.5 opacity-70 tabular-nums">{e.intensity}/5</span>
                  )}
                </Link>
              );
            })}
          </div>
          <div className="flex gap-2 mt-5">
            <button
              type="button"
              aria-disabled
              title="Save to your list — Phase 4"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-surface-2 border border-border text-text/90 text-sm cursor-not-allowed opacity-80"
            >
              + Save
            </button>
            <button
              type="button"
              aria-disabled
              title="Watchlist — Phase 4"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-surface-2 border border-border text-text/90 text-sm cursor-not-allowed opacity-80"
            >
              Watchlist
            </button>
            <Link
              href={`/where-to-watch/${slug}`}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-soft"
            >
              Where to watch →
            </Link>
          </div>
        </div>
      </section>

      {/* Summary */}
      {data.spoilerSafeSummary && (
        <section className="mt-8 max-w-3xl">
          <h2 className="text-[10px] uppercase tracking-[0.12em] text-faint font-medium mb-2">
            Synopsis (spoiler-safe)
          </h2>
          <p className="text-md leading-relaxed text-text/90">{data.spoilerSafeSummary}</p>
        </section>
      )}

      {/* Why people connect — driven by mapping evidence_notes */}
      {data.topEmotions.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-display font-semibold mb-4">
            Why people connect with{' '}
            <span className="text-accent-soft">{data.name}</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {data.topEmotions.slice(0, 4).map((e) => {
              const colorKey = EMOTION_COLOR_KEY[e.emotion.name];
              return (
                <article key={e.emotion.id} className="lift-card p-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <span
                      className={
                        'text-[11px] font-medium uppercase tracking-wider ' +
                        (colorKey ? `text-emotion-${colorKey}` : 'text-accent')
                      }
                    >
                      {e.emotion.name}
                    </span>
                    {e.intensity !== null && (
                      <span className="text-[11px] text-muted tabular-nums">
                        Intensity {e.intensity}/5 · {e.confidence}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text/90 leading-relaxed">{e.evidenceNotes}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Key characters */}
      {chars.length > 0 && (
        <section className="mt-10">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-display font-semibold">Key characters</h2>
            <Link
              href={`/characters?title=${slug}`}
              className="text-[12px] text-accent hover:text-accent-soft"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {chars.slice(0, 8).map((c) => (
              <Link
                key={c.id}
                href={`/character/${c.slug}`}
                className="lift-card p-3 block"
              >
                <div className="aspect-square rounded-md bg-gradient-to-br from-accent/30 to-emotion-ambition/20 mb-2 flex items-center justify-center text-2xl font-display font-semibold text-text/80">
                  {c.name.slice(0, 1)}
                </div>
                <div className="text-[13px] font-medium leading-tight truncate">{c.name}</div>
                {c.role && <div className="text-[11px] text-muted mt-0.5 truncate">{c.role}</div>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Similar titles */}
      {similar.length > 0 && (
        <section className="mt-10 mb-10">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-display font-semibold">Similar (emotionally)</h2>
            <span className="text-[11px] text-muted">
              Ranked by shared emotional mappings
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {similar.map((s) => {
              const sp = resolvePoster(s.title);
              return (
                <Link key={s.title.id} href={`/anime/${s.title.slug}`} className="block">
                  <article className="lift-card overflow-hidden">
                    <div className="aspect-[2/3] relative bg-surface-2">
                      {sp ? (
                        <Image
                          src={sp}
                          alt={`${s.title.name} cover`}
                          fill
                          sizes="(max-width: 768px) 50vw, 180px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-faint text-[10px]">
                          No poster
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-bg/95 to-transparent p-2">
                        <div className="text-[12px] font-semibold leading-tight line-clamp-2">
                          {s.title.name}
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="text-[10px] text-muted">
                        {s.sharedEmotionCount} shared emotion{s.sharedEmotionCount === 1 ? '' : 's'}
                      </div>
                      <div className="text-[10px] text-faint truncate mt-0.5">
                        {s.sharedEmotionNames.slice(0, 3).join(' · ')}
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </AppShell>
  );
}
