import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { Hex, Avatar } from '@animood/ui';
import { NAV_SECTIONS, MOOD_PILLS, type NavItem } from '@/lib/nav';
import { TRENDING_WEEK, type TrendingWeekItem } from '@/lib/posters';
import { IconBell } from '@/lib/icons';

/**
 * Marketing/discovery shell — sidebar + topbar + main + optional right rail.
 * Mirrors the AniMood mockup layout precisely.
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
          <main className="flex-1 px-5 lg:px-8 py-6 overflow-x-hidden min-w-0">
            <div className="max-w-content mx-auto">{children}</div>
          </main>
          {rightRail ? <RightRailColumn>{rightRail}</RightRailColumn> : null}
        </div>
      </div>
    </div>
  );
}

function SidebarColumn({ currentPath }: { currentPath: string }) {
  return (
    <aside className="w-sidebar bg-surface/80 backdrop-blur-md border-r border-border flex flex-col flex-shrink-0 h-screen sticky top-0 overflow-y-auto scroll-hide">
      <div className="px-4 py-4 border-b border-border">
        <Link href="/" className="inline-flex items-baseline gap-1">
          <span className="text-xl font-display font-semibold tracking-tight">emo</span>
          <span className="relative inline-block">
            <span className="absolute -inset-1 rounded-full bg-accent/50 blur-md" aria-hidden />
            <span className="relative text-accent text-2xl leading-none">✦</span>
          </span>
          <span className="text-xl font-display font-semibold tracking-tight">nime</span>
        </Link>
      </div>

      <nav className="flex-1 p-2 space-y-5 text-sm">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si}>
            {section.title && (
              <div className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.12em] text-faint font-medium">
                {section.title}
              </div>
            )}
            <ul className="space-y-0.5">
              {section.items.map((it) => (
                <NavItemRow key={it.href} item={it} active={isActive(currentPath, it.href)} />
              ))}
            </ul>
          </div>
        ))}

        <div>
          <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.12em] text-faint font-medium">
            How are you feeling today?
          </div>
          <div className="px-1 flex flex-col gap-0.5">
            {MOOD_PILLS.map((m) => (
              <Link
                key={m.slug}
                href={`/discover?mood=${m.slug}`}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-text/90 hover:bg-accent/10 hover:text-accent-soft transition-colors text-[13px]"
              >
                <span className="text-base leading-none" aria-hidden>{m.emoji}</span>
                <span className="truncate">{m.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <MascotQuizCard />
    </aside>
  );
}

function isActive(path: string, href: string): boolean {
  if (href === '/') return path === '/';
  return path === href || path.startsWith(href + '/');
}

function NavItemRow({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <li>
      <Link
        href={item.href}
        className={
          'group relative flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-colors ' +
          (active
            ? 'bg-accent/15 text-accent-soft'
            : 'text-text/90 hover:bg-surface-2 hover:text-text')
        }
      >
        {active && (
          <span
            aria-hidden
            className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-accent rounded-r"
          />
        )}
        {item.icon ? (
          <span
            className={
              'w-4 h-4 shrink-0 flex items-center justify-center ' +
              (active ? 'text-accent' : 'text-muted group-hover:text-text')
            }
          >
            {item.icon}
          </span>
        ) : null}
        <span className="truncate">{item.label}</span>
      </Link>
    </li>
  );
}

function MascotQuizCard() {
  return (
    <div className="p-3 border-t border-border">
      <Link
        href="/quiz"
        className="relative block rounded-xl overflow-hidden bg-gradient-to-br from-accent/25 via-emotion-ambition/20 to-emotion-rebuilding/20 border border-accent/30 p-3 pt-2 hover:border-accent/60 transition-colors group"
      >
        <div className="relative h-20 -mt-1 -mx-1 mb-1.5">
          <Image
            src="/generated/mascot.png"
            alt="AniMood mascot"
            fill
            sizes="200px"
            className="object-cover object-top rounded-md"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg/60 rounded-md" aria-hidden />
        </div>
        <div className="relative">
          <div className="text-[13px] font-semibold leading-tight">Take the Anime<br />Emotional Quiz</div>
          <p className="text-[11px] text-muted mt-1 leading-snug">
            Discover anime that truly understand you.
          </p>
          <div className="mt-2 inline-flex items-center justify-center h-7 px-3 rounded-md bg-accent text-white text-[12px] font-medium group-hover:bg-accent-soft transition-colors">
            Start Quiz
          </div>
        </div>
      </Link>
    </div>
  );
}

function Topbar() {
  return (
    <header className="h-topbar bg-bg/70 backdrop-blur-xl border-b border-border sticky top-0 z-10 flex items-center px-5 lg:px-8 gap-4">
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search anime, manga, themes, emotions…"
            className="w-full h-10 pl-10 pr-3 bg-surface-2/70 border border-border rounded-full text-[13px] placeholder:text-faint focus:outline-none focus:border-accent/50 focus:bg-surface-2"
          />
        </div>
      </div>
      <div className="flex-1" />
      <button
        type="button"
        aria-label="Notifications"
        className="relative w-9 h-9 rounded-full bg-surface-2 border border-border hover:border-muted text-muted hover:text-text inline-flex items-center justify-center"
      >
        <IconBell width={16} height={16} />
        <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent" aria-hidden />
      </button>
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-medium hidden sm:inline">Harish</span>
        <Avatar name="Harish" size="sm" ring />
      </div>
    </header>
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
