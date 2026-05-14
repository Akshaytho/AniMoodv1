import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { Hex, Avatar } from '@animood/ui';
import { TRENDING_WEEK, type TrendingWeekItem } from '@/lib/posters';
import { SidebarColumn } from './Sidebar.client';
import { Topbar } from './Topbar.client';

/**
 * Marketing/discovery shell — sidebar + topbar + main + optional right rail.
 * Sidebar is a hamburger drawer below md:, sticky column at md:+.
 */
export function AppShell({
  children,
  rightRail,
  currentPath = '/',
}: {
  children: ReactNode;
  rightRail?: ReactNode;
  currentPath?: string;
}) {
  return (
    <div className="flex min-h-screen">
      <SidebarColumn currentPath={currentPath} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <div className="flex-1 flex overflow-x-hidden">
          <main className="flex-1 px-4 md:px-5 lg:px-8 py-6 overflow-x-hidden min-w-0">
            <div className="max-w-content mx-auto">{children}</div>
          </main>
          {rightRail ? <RightRailColumn>{rightRail}</RightRailColumn> : null}
        </div>
      </div>
    </div>
  );
}

function RightRailColumn({ children }: { children: ReactNode }) {
  return (
    <aside className="w-right-rail border-l border-border flex-shrink-0 hidden xl:flex flex-col h-[calc(100vh-theme(height.topbar))] sticky top-topbar overflow-y-auto scroll-hide p-4 gap-5">
      {children}
    </aside>
  );
}

/* ============================ Right-rail widgets ============================ */

export function RightRailEmotionalProfile() {
  return (
    <section className="lift-card p-4">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-[13px] font-semibold">Your Emotional Profile</h3>
      </div>
      <div className="flex justify-center -my-2">
        <Hex
          size={220}
          axes={[
            { label: 'Reflective', value: 0.84 },
            { label: 'Emotional', value: 0.91 },
            { label: 'Dark', value: 0.55 },
            { label: 'Hopeful', value: 0.72 },
            { label: 'Calm', value: 0.66 },
            { label: 'Cloud', value: 0.61 },
          ]}
        />
      </div>
      <p className="text-[11px] text-muted leading-relaxed mt-1 mb-3">
        You connect deeply with emotional and existentially heavy stories.
      </p>
      <Link
        href="/profile"
        className="block w-full text-center text-[12px] h-8 leading-8 rounded-md bg-surface-2 border border-border hover:border-accent/50 text-text"
      >
        View Full Profile
      </Link>
    </section>
  );
}

export function RightRailCommunityDiscussions() {
  const items = [
    { user: 'KaitoX', q: 'Did Eren really want freedom?', replies: 142, hue: 'accent' },
    { user: 'mira_', q: 'Why are people 25 hr different with Eva?', replies: 87, hue: 'warning' },
    { user: 'shiro', q: 'Anime that changed your life forever?', replies: 311, hue: 'success' },
    { user: 'arashi', q: 'Most misunderstood anime ending?', replies: 56, hue: 'danger' },
  ];
  return (
    <section className="lift-card p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[13px] font-semibold">Community Discussions</h3>
        <Link href="/community" className="text-[11px] text-muted hover:text-accent">View all</Link>
      </div>
      <ul className="space-y-2.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2.5 items-start">
            <Avatar name={it.user} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium leading-tight">{it.q}</div>
              <div className="text-[11px] text-muted mt-0.5">{it.replies} replies · {it.user}</div>
            </div>
            <span
              aria-hidden
              className={
                'mt-1 w-1.5 h-1.5 rounded-full ' +
                (it.hue === 'accent'
                  ? 'bg-accent'
                  : it.hue === 'success'
                    ? 'bg-success'
                    : it.hue === 'warning'
                      ? 'bg-warning'
                      : 'bg-danger')
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RightRailTrendingThisWeek() {
  return (
    <section className="lift-card p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[13px] font-semibold">Trending This Week</h3>
        <Link href="/discover?sort=trending" className="text-[11px] text-muted hover:text-accent">View all</Link>
      </div>
      <ol className="space-y-2.5">
        {TRENDING_WEEK.map((it: TrendingWeekItem) => (
          <li key={it.rank}>
            <Link href={`/anime/${it.slug}`} className="flex items-center gap-2.5 group">
              <span className="w-4 text-center text-[11px] font-mono text-muted tabular-nums">
                {it.rank}
              </span>
              <div className="w-9 h-12 rounded-md overflow-hidden flex-shrink-0 relative bg-surface-3">
                <Image
                  src={it.posterUrl}
                  alt={it.name}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium truncate group-hover:text-accent-soft transition-colors">
                  {it.name}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted mt-0.5">
                  <span className="tabular-nums">★ {it.score.toFixed(2)}</span>
                  <span className="text-faint">·</span>
                  <span className="truncate">{it.tag}</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
