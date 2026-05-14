import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  AppShell,
  RightRailEmotionalProfile,
  RightRailTrendingThisWeek,
} from '@/components/AppShell';
import { Stub } from '@/components/Stub';
import { getEmotionBySlug } from '@/lib/queries';
import { resolvePoster } from '@/lib/poster-url';
import { resolveEmotion, humanize } from '@/lib/seed-lookup';
import { buildThing } from '@animood/seo';

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
  const e = await getEmotionBySlug(slug).catch(() => null);
  if (!e) return { title: resolveEmotion(slug) ?? humanize(slug) };
  return {
    title: `${e.name} — anime that resonates`,
    description: e.definition,
    alternates: { canonical: `/emotion/${slug}` },
  };
}

export default async function EmotionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getEmotionBySlug(slug).catch(() => null);

  if (!data) {
    return (
      <Stub
        title={resolveEmotion(slug) ?? humanize(slug)}
        description="This emotion isn't in the AniMood ontology yet. The 16 seeded emotions cover the most common discovery moods; n8n's W3 extraction will surface more over time."
        upcomingIn="extraction pending"
        currentPath="/discover"
      />
    );
  }

  const colorKey = EMOTION_COLOR_KEY[data.name];
  const colorClass = colorKey ? `text-emotion-${colorKey}` : 'text-accent';
  const bgClass = colorKey ? `bg-emotion-${colorKey}` : 'bg-accent';

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://animood.app';
  const jsonLd = buildThing({
    baseUrl,
    kind: 'emotion',
    slug,
    name: data.name,
    description: data.definition,
    relatedTitles: data.titles.slice(0, 8).map((t) => ({
      kind:
        t.title.type === 'manga' || t.title.type === 'manhwa'
          ? (t.title.type as 'manga' | 'manhwa')
          : ('anime' as const),
      slug: t.title.slug,
      name: t.title.name,
    })),
  });

  return (
    <AppShell
      currentPath="/discover"
      rightRail={
        <>
          <section className="lift-card p-4">
            <h3 className="text-[13px] font-semibold mb-3">Top titles for this emotion</h3>
            <ol className="space-y-2.5">
              {data.titles.slice(0, 5).map((t, i) => {
                const poster = resolvePoster(t.title);
                return (
                  <li key={t.title.id}>
                    <Link
                      href={`/anime/${t.title.slug}`}
                      className="flex items-center gap-2.5 group"
                    >
                      <span className="w-4 text-center text-[11px] font-mono text-muted tabular-nums">
                        {i + 1}
                      </span>
                      <div className="w-9 h-12 rounded-md overflow-hidden flex-shrink-0 relative bg-surface-3">
                        {poster && (
                          <Image
                            src={poster}
                            alt={t.title.name}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium truncate group-hover:text-accent-soft transition-colors">
                          {t.title.name}
                        </div>
                        <div className="text-[11px] text-muted">
                          {t.intensity ?? '—'}/5 · {t.confidence}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
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
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface/40 p-8 md:p-10">
        <div
          className={`absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none ${bgClass}`}
          aria-hidden
        />
        <div className="relative">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted">
            <span className={`w-1.5 h-1.5 rounded-full ${bgClass}`} aria-hidden />
            Emotion · {data.category}
          </div>
          <h1 className={`font-display text-4xl md:text-5xl font-semibold mt-3 ${colorClass}`}>
            {data.name}
          </h1>
          <p className="text-text/90 mt-3 text-md max-w-2xl leading-relaxed">{data.definition}</p>
          <div className="mt-5 flex flex-wrap gap-3 text-[12px] text-muted">
            <span className="px-2.5 py-1 rounded-pill bg-surface-2 border border-border">
              Intensity range: {data.intensityMin}–{data.intensityMax}
            </span>
            <span className="px-2.5 py-1 rounded-pill bg-surface-2 border border-border">
              {data.titles.length} title{data.titles.length === 1 ? '' : 's'} mapped
            </span>
            {data.sensitive && (
              <span className="px-2.5 py-1 rounded-pill bg-danger-soft border border-danger/40 text-danger">
                Sensitive
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Titles ranked by intensity */}
      {data.titles.length > 0 ? (
        <section className="mt-8">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-display font-semibold">
              Anime that resonate with <span className={colorClass}>{data.name}</span>
            </h2>
            <span className="text-[11px] text-muted">Ranked by intensity</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.titles.map((t) => {
              const poster = resolvePoster(t.title);
              return (
                <article key={t.title.id} className="lift-card overflow-hidden">
                  <Link href={`/anime/${t.title.slug}`} className="block">
                    <div className="aspect-[2/3] relative bg-surface-2">
                      {poster ? (
                        <Image
                          src={poster}
                          alt={`${t.title.name} cover`}
                          fill
                          sizes="(max-width: 768px) 50vw, 240px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-faint text-xs">
                          No poster
                        </div>
                      )}
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-bg/70 backdrop-blur ring-1 ring-white/10 text-[11px] flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${bgClass}`} aria-hidden />
                        <span className="tabular-nums font-medium">
                          {t.intensity ?? '—'}/5
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-bg/95 via-bg/40 to-transparent p-2.5">
                        <h3 className="text-[13px] font-semibold leading-tight line-clamp-2">
                          {t.title.name}
                        </h3>
                        <p className="text-[10px] text-muted mt-0.5">
                          {t.title.type} · {t.title.releaseYear ?? '—'}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="p-3">
                    <p className="text-[12px] text-text/85 leading-relaxed line-clamp-3">
                      {t.evidenceNotes}
                    </p>
                    <div className="mt-2 text-[10px] uppercase tracking-wider text-faint">
                      Confidence · {t.confidence}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="mt-8 lift-card p-8 text-center">
          <p className="text-muted text-sm">
            No titles mapped to <span className={colorClass}>{data.name}</span> yet. The W3
            extraction pipeline will surface matches once it runs on AniList + MAL signals.
          </p>
        </section>
      )}

      {/* Related emotions */}
      {data.related.length > 0 && (
        <section className="mt-10 mb-10">
          <h2 className="text-lg font-display font-semibold mb-4">
            Emotions that often appear alongside {data.name}
          </h2>
          <div className="flex gap-2 flex-wrap">
            {data.related.map((r) => {
              const k = EMOTION_COLOR_KEY[r.emotion.name];
              const cls = k
                ? `bg-emotion-${k}/10 text-emotion-${k} border-emotion-${k}/30`
                : 'bg-surface-2 text-muted border-border';
              return (
                <Link
                  key={r.emotion.id}
                  href={`/emotion/${r.emotion.slug}`}
                  className={`px-3 py-1.5 rounded-pill text-[12px] font-medium border ${cls} hover:opacity-90`}
                >
                  {r.emotion.name}
                  <span className="ml-1.5 opacity-70 tabular-nums">{r.overlapCount}×</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </AppShell>
  );
}
