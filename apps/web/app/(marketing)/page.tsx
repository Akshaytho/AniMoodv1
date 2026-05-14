import Link from 'next/link';
import Image from 'next/image';
import { TRENDING } from '@/lib/posters';
import { GRAPH_NODES, GRAPH_LINKS } from '@/lib/emotion-graph-data';
import {
  AppShell,
  RightRailEmotionalProfile,
  RightRailCommunityDiscussions,
  RightRailTrendingThisWeek,
} from '@/components/AppShell';
import { EmotionGraph } from '@/components/EmotionGraph.client';
import { FadeStack, FadeItem } from '@/components/MotionFadeUp.client';

export default function Home() {
  return (
    <AppShell
      currentPath="/"
      rightRail={
        <>
          <RightRailEmotionalProfile />
          <RightRailCommunityDiscussions />
          <RightRailTrendingThisWeek />
        </>
      }
    >
      <FadeStack className="space-y-6">
        {/* Hero */}
        <FadeItem>
          <section className="relative overflow-hidden rounded-2xl border border-border h-[260px] md:h-[300px]">
            <Image
              src="/generated/hero.png"
              alt=""
              fill
              priority
              sizes="(min-width: 1280px) 880px, 100vw"
              className="object-cover object-center"
            />
            {/* Left-side darkening so headline reads */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, rgba(8,7,12,0.85) 0%, rgba(8,7,12,0.45) 45%, rgba(8,7,12,0) 75%)',
              }}
              aria-hidden
            />
            <div className="relative h-full flex items-center p-8 md:p-12">
              <div className="max-w-xl">
                <h1 className="font-display text-3xl md:text-5xl font-semibold text-balance">
                  Find stories that <span className="text-grad">understand you.</span>
                </h1>
                <p className="text-muted mt-3 text-md">Not just anime. Your anime.</p>
                <div className="mt-5">
                  <Link
                    href="/discover"
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-md bg-accent text-white font-medium hover:bg-accent-soft transition-colors"
                    style={{ boxShadow: '0 0 0 1px rgba(124,92,255,0.4), 0 12px 32px -8px rgba(124,92,255,0.6)' }}
                  >
                    Discover Now
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </FadeItem>

        {/* Recommended row */}
        <FadeItem>
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-lg font-display font-semibold">Recommended for your current mood</h2>
              <Link href="/discover" className="text-[12px] text-accent hover:text-accent-soft">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {TRENDING.map((t) => (
                <Link key={t.slug} href={`/anime/${t.slug}`} className="block">
                  <article className="lift-card overflow-hidden">
                    <div className="aspect-[2/3] relative overflow-hidden bg-surface-2">
                      <Image
                        src={t.posterUrl}
                        alt={`${t.name} cover`}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 200px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* gradient scrim */}
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-bg/95 via-bg/30 to-transparent pointer-events-none"
                        aria-hidden
                      />
                      {/* score chip */}
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-bg/70 backdrop-blur ring-1 ring-white/10 text-[11px] flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#ffb547">
                          <path d="M12 2l2.9 6.4 7.1.6-5.4 4.7 1.7 6.9L12 17l-6.3 3.6 1.7-6.9L2 9l7.1-.6L12 2z" />
                        </svg>
                        <span className="tabular-nums font-medium">{t.score.toFixed(2)}</span>
                      </div>
                      {/* title overlay on cover */}
                      <div className="absolute bottom-0 left-0 right-0 p-2.5">
                        <h3 className="text-[13px] font-semibold leading-tight line-clamp-2 mb-1.5">
                          {t.name}
                        </h3>
                        <p className="text-[10px] text-muted">{t.meta}</p>
                      </div>
                    </div>
                    <div className="p-2 flex gap-1 flex-wrap">
                      {t.emotions.slice(0, 3).map((e) => (
                        <span
                          key={e.slug}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium border bg-emotion-${e.colorKey}/10 text-emotion-${e.colorKey} border-emotion-${e.colorKey}/30`}
                        >
                          {e.name}
                        </span>
                      ))}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        </FadeItem>

        {/* Emotional Universe — real force-directed graph */}
        <FadeItem>
          <section className="rounded-2xl border border-border bg-surface/40 backdrop-blur-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-baseline justify-between">
              <div>
                <h2 className="text-lg font-display font-semibold">Explore the Emotional Universe</h2>
                <p className="text-[12px] text-muted mt-1">
                  Click any node to traverse — emotions, themes, and titles in one graph.
                </p>
              </div>
              <Link href="/map" className="text-[12px] text-accent hover:text-accent-soft">
                Open full map
              </Link>
            </div>
            <div className="grid lg:grid-cols-[180px_1fr] gap-4 pb-4">
              <div className="px-5 lg:pl-5 lg:pr-0">
                <div className="text-[10px] uppercase tracking-[0.12em] text-faint font-medium mb-2">
                  Legend
                </div>
                <ul className="space-y-1.5 text-[12px]">
                  <LegendDot color="#5b8def" label="Emotion" />
                  <LegendDot color="#9b85ff" label="Theme" />
                  <LegendDot color="#cfcfd8" label="Anime / Manga" />
                </ul>
                <div className="mt-4 pt-3 border-t border-border text-[11px] text-muted leading-relaxed">
                  Drag a node to reposition. Scroll to zoom. Click a label to jump to that page.
                </div>
              </div>
              <div className="px-2 lg:pr-5">
                <EmotionGraph nodes={GRAPH_NODES} links={GRAPH_LINKS} height={380} />
              </div>
            </div>
          </section>
        </FadeItem>

        {/* Opinions Spectrum */}
        <FadeItem>
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-lg font-display font-semibold">Opinions Spectrum</h2>
              <Link href="/opinions" className="text-[12px] text-accent hover:text-accent-soft">
                View all
              </Link>
            </div>
            <div className="lift-card p-5 grid md:grid-cols-[280px_1fr_1fr] gap-5">
              <div className="flex gap-3">
                <div className="w-20 h-28 relative rounded-md overflow-hidden flex-shrink-0 bg-surface-2 ring-1 ring-border">
                  <Image
                    src="https://cdn.myanimelist.net/images/anime/10/47347l.webp"
                    alt="Attack on Titan cover"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-faint">Featured</div>
                  <div className="text-[15px] font-semibold mt-0.5">Attack on Titan</div>
                  <div className="flex items-baseline gap-1.5 mt-1.5">
                    <span className="text-[24px] font-display font-semibold tabular-nums">8.54</span>
                    <span className="text-[10px] text-muted">★ · 3,540 votes</span>
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    <Chip>Revenge</Chip>
                    <Chip>Identity</Chip>
                    <Chip>Moral</Chip>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-success font-medium mb-2.5">
                  Why people love it
                </div>
                <ul className="space-y-2 text-[12px]">
                  <OpinionBar label="Story &amp; plot tension" value={92} kind="positive" />
                  <OpinionBar label="Character development" value={86} kind="positive" />
                  <OpinionBar label="Emotional impact" value={88} kind="positive" />
                  <OpinionBar label="Themes are deep" value={79} kind="positive" />
                </ul>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-danger font-medium mb-2.5">
                  Why some don&apos;t
                </div>
                <ul className="space-y-2 text-[12px]">
                  <OpinionBar label="Pacing in mid arcs" value={64} kind="negative" />
                  <OpinionBar label="Too much politics late on" value={51} kind="negative" />
                  <OpinionBar label="Confusing at times" value={37} kind="negative" />
                </ul>
              </div>
            </div>
          </section>
        </FadeItem>
      </FadeStack>
    </AppShell>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium border bg-surface-2 text-muted border-border">
      {children}
    </span>
  );
}

function OpinionBar({
  label,
  value,
  kind,
}: {
  label: string;
  value: number;
  kind: 'positive' | 'negative';
}) {
  const bar = kind === 'positive' ? 'bg-success' : 'bg-danger';
  const text = kind === 'positive' ? 'text-success' : 'text-danger';
  return (
    <li>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-muted">{label}</span>
        <span className={`${text} tabular-nums`}>{value}%</span>
      </div>
      <div className="w-full h-1.5 rounded-pill bg-surface-2 overflow-hidden">
        <div className={`h-full rounded-pill ${bar}`} style={{ width: `${value}%` }} />
      </div>
    </li>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <li className="flex items-center gap-2 text-text">
      <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
      <span>{label}</span>
    </li>
  );
}
