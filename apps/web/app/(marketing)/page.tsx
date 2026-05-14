import Link from 'next/link';
import Image from 'next/image';
import { Card, PosterCard } from '@animood/ui';
import { TRENDING } from '@/lib/posters';
import {
  AppShell,
  RightRailEmotionalProfile,
  RightRailCommunityDiscussions,
  RightRailTrendingThisWeek,
} from '@/components/AppShell';

export default function Home() {
  return (
    <AppShell
      rightRail={
        <>
          <RightRailEmotionalProfile />
          <RightRailCommunityDiscussions />
          <RightRailTrendingThisWeek />
        </>
      }
    >
      <div className="space-y-8">
        {/* Hero with atmospheric background */}
        <section className="relative overflow-hidden rounded-2xl border border-border min-h-[260px]">
          {/* Layered background: deep night-sky gradient, city silhouette, and color wash. */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(180deg, rgba(10,10,11,0) 0%, rgba(10,10,11,0.6) 70%, rgba(10,10,11,0.95) 100%), linear-gradient(180deg, #1d1a3a 0%, #3a1e4f 40%, #6a2d63 70%, #b34c75 100%)',
            }}
            aria-hidden
          />
          {/* City silhouette */}
          <svg
            className="absolute bottom-0 left-0 right-0 w-full h-32 text-bg/95"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M0 120 L0 78 L20 78 L20 60 L40 60 L40 70 L65 70 L65 50 L80 50 L80 65 L100 65 L100 40 L115 40 L115 55 L130 55 L130 25 L140 25 L140 55 L160 55 L160 75 L185 75 L185 50 L195 50 L195 30 L205 30 L205 50 L220 50 L220 70 L240 70 L240 45 L260 45 L260 60 L275 60 L275 80 L300 80 L300 55 L315 55 L315 35 L330 35 L330 60 L350 60 L350 75 L370 75 L370 45 L385 45 L385 65 L400 65 L400 50 L420 50 L420 70 L445 70 L445 55 L465 55 L465 75 L485 75 L485 45 L505 45 L505 60 L525 60 L525 30 L540 30 L540 55 L560 55 L560 75 L580 75 L580 50 L600 50 L600 65 L625 65 L625 40 L640 40 L640 60 L660 60 L660 80 L680 80 L680 55 L700 55 L700 75 L725 75 L725 50 L745 50 L745 70 L765 70 L765 45 L780 45 L780 60 L800 60 L800 75 L825 75 L825 50 L845 50 L845 30 L860 30 L860 55 L880 55 L880 70 L900 70 L900 45 L920 45 L920 60 L940 60 L940 80 L960 80 L960 55 L980 55 L980 75 L1000 75 L1000 50 L1020 50 L1020 65 L1040 65 L1040 40 L1060 40 L1060 60 L1080 60 L1080 80 L1100 80 L1100 55 L1120 55 L1120 75 L1140 75 L1140 50 L1160 50 L1160 70 L1180 70 L1180 45 L1200 45 L1200 120 Z"
              fill="currentColor"
            />
          </svg>
          {/* Character silhouette + glow on the right */}
          <div
            className="absolute right-12 top-8 bottom-0 w-48 hidden md:block"
            aria-hidden
          >
            <div className="absolute inset-0 bg-hero-glow opacity-80" />
            <svg viewBox="0 0 200 280" className="absolute inset-0 w-full h-full text-bg/95" fill="currentColor">
              {/* simplified standing-figure silhouette: head, hair, shoulders, body */}
              <path d="M100 30 Q78 30 76 56 Q70 70 78 88 Q70 96 76 110 Q88 118 102 116 Q116 118 124 110 Q132 96 124 88 Q130 70 124 56 Q122 30 100 30Z" />
              <path d="M70 120 L130 120 L138 200 L152 280 L48 280 L62 200 L70 120Z" />
            </svg>
          </div>

          <div className="relative p-8 md:p-12 max-w-2xl">
            <h1 className="font-display text-4xl md:text-5xl leading-tight font-semibold">
              Find stories that{' '}
              <span className="text-accent">understand you.</span>
            </h1>
            <p className="text-muted mt-3 max-w-md text-md">Not just anime. Your anime.</p>
            <div className="mt-5">
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-md bg-accent text-white font-medium hover:bg-accent-soft transition-colors shadow-accentGlow"
              >
                Discover now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Recommended row */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-display font-semibold">Recommended for your current mood</h2>
            <Link href="/discover" className="text-sm text-muted hover:text-accent">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 200px"
                    className="object-cover"
                  />
                }
              />
            ))}
          </div>
        </section>

        {/* Emotional Universe — placeholder until commit 12 ships the real force-graph */}
        <section className="rounded-2xl border border-border bg-surface p-5 md:p-7 min-h-[280px] relative overflow-hidden">
          <div className="absolute inset-0 opacity-25 pointer-events-none" aria-hidden>
            <NodesPattern />
          </div>
          <div className="relative">
            <h2 className="text-xl font-display font-semibold">Explore the Emotional Universe</h2>
            <p className="text-sm text-muted mt-1 max-w-md">
              A force-directed graph of emotions, themes, and titles. Click any node to traverse:
              from Loneliness to Rebuilding, from Vinland Saga to its softer alternatives.
            </p>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 mt-4 px-4 h-9 rounded-md bg-surface-2 border border-border hover:border-accent/50 text-sm text-text"
            >
              Open the full map →
            </Link>
            <span className="ml-2 inline-block text-xs text-faint">
              · Interactive version arrives in commit 12
            </span>
          </div>
        </section>

        {/* Opinions Spectrum */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-display font-semibold">Opinions Spectrum</h2>
            <Link href="/opinions" className="text-sm text-muted hover:text-accent">
              View all →
            </Link>
          </div>
          <Card padding="lg" className="grid md:grid-cols-[260px_1fr_1fr] gap-6">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted mb-1">Featured</div>
              <div className="text-lg font-semibold">Attack on Titan</div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-display font-semibold tabular-nums">8.54</span>
                <span className="text-xs text-muted">avg score · 2,340 votes</span>
              </div>
              <div className="mt-3 flex gap-2 text-xs flex-wrap">
                <span className="px-2 py-0.5 rounded bg-surface-2 border border-border text-muted">Revenge</span>
                <span className="px-2 py-0.5 rounded bg-surface-2 border border-border text-muted">Identity</span>
                <span className="px-2 py-0.5 rounded bg-surface-2 border border-border text-muted">Moral ambiguity</span>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-success mb-2">Why people love it</div>
              <ul className="space-y-2 text-sm">
                <OpinionBar label="Story & plot tension" value={92} positive />
                <OpinionBar label="Character development" value={86} positive />
                <OpinionBar label="Emotional impact" value={88} positive />
                <OpinionBar label="Themes are deep" value={79} positive />
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-danger mb-2">Why some don't</div>
              <ul className="space-y-2 text-sm">
                <OpinionBar label="Pacing in mid arcs" value={64} />
                <OpinionBar label="Too much politics late on" value={51} />
                <OpinionBar label="Confusing at times" value={37} />
              </ul>
            </div>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}

function OpinionBar({ label, value, positive }: { label: string; value: number; positive?: boolean }) {
  return (
    <li>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-muted">{label}</span>
        <span className={positive ? 'text-success' : 'text-warning'}>{value}%</span>
      </div>
      <div className="w-full h-1.5 rounded-pill bg-surface-2 overflow-hidden">
        <div
          className={`h-full rounded-pill ${positive ? 'bg-success' : 'bg-warning'}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </li>
  );
}

/** Decorative "stars in space" background for the emotional universe placeholder. */
function NodesPattern() {
  // deterministic so server-render and hydration match
  const seed = [3, 7, 11, 17, 23, 31, 41, 53, 67, 79, 89, 97, 109, 127, 137, 149];
  const pts = seed.map((n) => ({
    x: ((n * 23 + 17) % 100) + (n % 13) * 5,
    y: ((n * 19 + 11) % 80) + (n % 7) * 3,
    r: 1 + ((n * 5) % 4),
  }));
  return (
    <svg viewBox="0 0 800 280" className="absolute inset-0 w-full h-full">
      {pts.map((p, i) => (
        <circle key={i} cx={p.x * 8} cy={p.y * 3.5} r={p.r} fill="#9b85ff" opacity="0.5" />
      ))}
    </svg>
  );
}
