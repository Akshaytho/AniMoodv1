import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { AppShell, RightRailEmotionalProfile, RightRailTrendingThisWeek } from '@/components/AppShell';
import { getDiscoverResults, getAllEmotionsForFilter, type DiscoverFilter } from '@/lib/queries';
import { posterUrlForSlug } from '@/lib/poster-url';
import { MOOD_PILLS } from '@/lib/nav';

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

// Lightweight mood → emotion-slug bridge so /discover?mood=lonely funnels into
// the same filter machinery as /discover?emotion=loneliness.
const MOOD_TO_EMOTION: Record<string, string> = {
  sad: 'grief',
  motivation: 'ambition',
  lonely: 'loneliness',
  overwhelmed: 'burnout',
  peace: 'peaceful-comfort',
  heartbroken: 'emotional-devastation',
  existential: 'existential-dread',
  curious: 'identity-crisis',
};

interface SP {
  mood?: string;
  emotion?: string;
  q?: string;
  type?: string;
  intensity?: string;
  sort?: string;
}

export const metadata: Metadata = {
  title: 'Discover by Emotion',
  description:
    'Filter anime, manga, and manhwa by mood, emotional theme, and intensity. Curated emotional discovery.',
  alternates: { canonical: '/discover' },
};

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const emotionSlugFromMood = sp.mood ? MOOD_TO_EMOTION[sp.mood] : undefined;
  const emotionSlug = sp.emotion ?? emotionSlugFromMood;

  const filter: DiscoverFilter = {};
  if (sp.q) filter.q = sp.q;
  if (emotionSlug) filter.emotionSlug = emotionSlug;
  if (sp.type === 'anime' || sp.type === 'manga' || sp.type === 'manhwa') filter.type = sp.type;
  if (sp.intensity) {
    const n = Number(sp.intensity);
    if (Number.isFinite(n)) filter.minIntensity = n;
  }
  if (sp.sort === 'recent' || sp.sort === 'name' || sp.sort === 'top') filter.sort = sp.sort;

  const [results, allEmotions] = await Promise.all([
    getDiscoverResults(filter),
    getAllEmotionsForFilter(),
  ]);

  const activeMood = sp.mood ? MOOD_PILLS.find((m) => m.slug === sp.mood) : undefined;
  const activeEmotion = emotionSlug ? allEmotions.find((e) => e.slug === emotionSlug) : undefined;
  const activeColorKey = activeEmotion ? EMOTION_COLOR_KEY[activeEmotion.name] : undefined;

  return (
    <AppShell
      currentPath="/discover"
      rightRail={
        <>
          <RightRailEmotionalProfile />
          <RightRailTrendingThisWeek />
        </>
      }
    >
      <header className="mb-6">
        <h1 className="font-display text-3xl md:text-4xl font-semibold">
          Discover by Emotion
        </h1>
        <p className="text-muted mt-2 text-md max-w-xl">
          Filter by mood, emotional theme, and intensity. Every match is backed by evidence — never just genre.
        </p>
      </header>

      {/* Active filter row */}
      {(activeMood || activeEmotion || sp.q) && (
        <div className="mb-5 flex items-center gap-2 flex-wrap text-[12px]">
          <span className="text-muted">Filters:</span>
          {sp.q && (
            <FilterChip href="/discover">Search: &ldquo;{sp.q}&rdquo; ✕</FilterChip>
          )}
          {activeMood && (
            <FilterChip href="/discover">
              {activeMood.emoji} {activeMood.label} ✕
            </FilterChip>
          )}
          {activeEmotion && !sp.mood && (
            <FilterChip href="/discover">{activeEmotion.name} ✕</FilterChip>
          )}
          <span className="text-faint">·</span>
          <span className="text-muted">{results.length} results</span>
        </div>
      )}

      {/* Emotion filter chip rail */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <Link
          href="/discover"
          className={
            'px-3 py-1.5 rounded-pill text-[12px] font-medium border transition-colors ' +
            (!emotionSlug
              ? 'bg-accent text-white border-accent'
              : 'bg-surface-2 text-muted border-border hover:border-muted')
          }
        >
          All
        </Link>
        {allEmotions.map((e) => {
          const k = EMOTION_COLOR_KEY[e.name];
          const active = e.slug === emotionSlug;
          const cls = active
            ? k
              ? `bg-emotion-${k} text-white border-emotion-${k}`
              : 'bg-accent text-white border-accent'
            : k
              ? `bg-emotion-${k}/10 text-emotion-${k} border-emotion-${k}/30 hover:opacity-80`
              : 'bg-surface-2 text-muted border-border hover:border-muted';
          return (
            <Link
              key={e.id}
              href={`/discover?emotion=${e.slug}`}
              className={`px-3 py-1.5 rounded-pill text-[12px] font-medium border transition-colors ${cls}`}
            >
              {e.name}
            </Link>
          );
        })}
      </div>

      {/* Results grid */}
      {results.length === 0 ? (
        <div className="lift-card p-10 text-center">
          <p className="text-muted text-sm">
            No matches for that combination. Try removing a filter, or{' '}
            <Link href="/discover" className="text-accent hover:text-accent-soft">
              clear all
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((r) => {
            const poster = posterUrlForSlug(r.title.slug);
            return (
              <Link
                key={r.title.id}
                href={`/anime/${r.title.slug}`}
                className="block"
              >
                <article className="lift-card overflow-hidden h-full">
                  <div className="aspect-[2/3] relative bg-surface-2">
                    {poster ? (
                      <Image
                        src={poster}
                        alt={`${r.title.name} cover`}
                        fill
                        sizes="(max-width: 768px) 50vw, 240px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-faint text-[10px]">
                        No poster
                      </div>
                    )}
                    {r.bestMatch?.intensity != null && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-bg/70 backdrop-blur ring-1 ring-white/10 text-[11px] tabular-nums font-medium">
                        {r.bestMatch.intensity}/5
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-bg/95 via-bg/40 to-transparent p-2.5">
                      <h3 className="text-[13px] font-semibold leading-tight line-clamp-2">
                        {r.title.name}
                      </h3>
                      <p className="text-[10px] text-muted mt-0.5">
                        {r.title.type} · {r.title.releaseYear ?? '—'}
                      </p>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <div className="flex gap-1 flex-wrap">
                      {r.topEmotions.slice(0, 3).map((te) => {
                        const k = EMOTION_COLOR_KEY[te.emotion.name];
                        const cls = k
                          ? `bg-emotion-${k}/10 text-emotion-${k} border-emotion-${k}/30`
                          : 'bg-surface-2 text-muted border-border';
                        return (
                          <span
                            key={te.emotion.id}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${cls}`}
                          >
                            {te.emotion.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-faint mt-10 leading-relaxed">
        Showing 30 hand-seeded titles for Phase A. W1 ingestion expands this to thousands
        once it runs against AniList + MAL.
        {activeColorKey && (
          <>
            {' '}Color accent: <span className={`text-emotion-${activeColorKey}`}>{activeEmotion?.name}</span>.
          </>
        )}
      </p>
    </AppShell>
  );
}

function FilterChip({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-2 py-0.5 rounded-pill bg-accent/15 text-accent-soft border border-accent/40 hover:bg-accent/25 transition-colors"
    >
      {children}
    </Link>
  );
}
