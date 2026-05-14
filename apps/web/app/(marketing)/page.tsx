import Link from 'next/link';
import Image from 'next/image';
import { Card, PosterCard, Tag, Hex, Stat } from '@animood/ui';
import { TRENDING } from '@/lib/posters';
import { MOOD_PILLS } from '@/lib/nav';

export default function Home() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" aria-hidden />
        <div className="relative grid md:grid-cols-[1.2fr_1fr] gap-6 p-8 md:p-12 items-center">
          <div>
            <h1 className="font-display text-4xl md:text-5xl leading-tight font-semibold">
              Find stories that{' '}
              <span className="text-accent">understand you.</span>
            </h1>
            <p className="text-muted mt-4 max-w-md text-md">
              Not just anime. Your anime. Curated by mood, theme, and emotional
              resonance — backed by real fan discussion, not guesses.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-md bg-accent text-white font-medium hover:bg-accent-soft transition-colors shadow-accentGlow"
              >
                Discover now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link
                href="/quiz"
                className="inline-flex items-center h-11 px-5 rounded-md bg-surface-2 border border-border text-text font-medium hover:bg-surface-3"
              >
                Take the quiz
              </Link>
            </div>
            <div className="mt-6 flex gap-2 flex-wrap">
              {MOOD_PILLS.slice(0, 6).map((m) => (
                <Link key={m.slug} href={`/discover?mood=${m.slug}`}>
                  <Tag>{m.label}</Tag>
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <Hex
              size={260}
              axes={[
                { label: 'Hopeful', value: 0.78 },
                { label: 'Reflective', value: 0.62 },
                { label: 'Dark', value: 0.34 },
                { label: 'Calm', value: 0.71 },
                { label: 'Intense', value: 0.55 },
                { label: 'Tender', value: 0.66 },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Trending */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-display font-semibold">Recommended for your current mood</h2>
          <Link href="/discover" className="text-sm text-muted hover:text-accent">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {TRENDING.map((t) => (
            <PosterCard
              key={t.slug}
              href={`/anime/${t.slug}`}
              title={t.name}
              meta={t.meta}
              score={t.score}
              tags={t.emotions}
              image={
                <Image
                  src={t.posterUrl}
                  alt={`${t.name} cover`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 220px"
                  className="object-cover"
                />
              }
            />
          ))}
        </div>
      </section>

      {/* Quick stats — placeholder until W6 embeddings + analytics flow */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Titles indexed" value="30" hint="seed cohort" />
        <Stat label="Emotion mappings" value="75" hint="human-reviewed" highlight />
        <Stat label="Characters profiled" value="10" />
        <Stat label="Avg confidence" value="High" hint="evidence ≥ 2 signals" />
      </section>

      {/* Discovery teaser */}
      <section className="grid md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-display text-lg font-semibold mb-2">Explore the Emotional Universe</h3>
          <p className="text-sm text-muted leading-relaxed">
            Browse a force-directed graph of emotions, themes, and titles. Click any node to
            traverse: from Loneliness to Rebuilding, from Vinland Saga to its softer alternatives.
          </p>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 mt-4 text-sm text-accent hover:text-accent-soft"
          >
            Open the map →
          </Link>
        </Card>
        <Card>
          <h3 className="font-display text-lg font-semibold mb-2">Opinions Spectrum</h3>
          <p className="text-sm text-muted leading-relaxed">
            See where the fanbase agrees and where it splits — story tension, character depth,
            emotional impact — by title.
          </p>
          <Link
            href="/opinions"
            className="inline-flex items-center gap-2 mt-4 text-sm text-accent hover:text-accent-soft"
          >
            See opinions →
          </Link>
        </Card>
      </section>
    </div>
  );
}
