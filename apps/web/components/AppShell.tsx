import Link from 'next/link';
import type { ReactNode } from 'react';
import { Hex, Avatar, Topbar } from '@animood/ui';
import { NAV_SECTIONS, MOOD_PILLS, type NavItem } from '@/lib/nav';
import { IconHeart } from '@/lib/icons';

/**
 * The full marketing/discovery shell from the mockup:
 *   sidebar (nav + mood pills + mascot quiz card)
 *   topbar (search + bell + user avatar)
 *   main content
 *   right rail (emotional profile + community + trending)
 */
export function AppShell({
  children,
  rightRail,
}: {
  children: ReactNode;
  rightRail?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <SidebarColumn />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar userName="Harish" />
        <div className="flex-1 flex overflow-x-hidden">
          <main className="flex-1 p-6 overflow-x-hidden min-w-0">
            <div className="max-w-content mx-auto">{children}</div>
          </main>
          {rightRail ? <RightRailColumn>{rightRail}</RightRailColumn> : null}
        </div>
      </div>
    </div>
  );
}

function SidebarColumn() {
  return (
    <aside className="w-sidebar bg-surface border-r border-border flex flex-col flex-shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-baseline gap-1 group">
          <span className="text-xl font-display font-semibold tracking-tight">
            emo<span className="text-accent">°</span>nime
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-2 space-y-4 text-sm">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si}>
            {section.title && (
              <div className="px-3 mb-1 text-xs uppercase tracking-wider text-faint">
                {section.title}
              </div>
            )}
            <ul className="space-y-0.5">
              {section.items.map((it) => (
                <NavItemRow key={it.href} item={it} />
              ))}
            </ul>
          </div>
        ))}

        <div>
          <div className="px-3 mb-2 text-xs uppercase tracking-wider text-faint">
            How are you feeling today?
          </div>
          <div className="px-1 flex flex-col gap-1">
            {MOOD_PILLS.map((m) => (
              <Link
                key={m.slug}
                href={`/discover?mood=${m.slug}`}
                className="flex items-center justify-between px-3 py-1.5 rounded-md text-text hover:bg-surface-2 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <IconHeart className="text-emotion-loneliness opacity-70" width={12} height={12} />
                  <span className="truncate">{m.label}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <MascotQuizCard />
    </aside>
  );
}

function NavItemRow({ item }: { item: NavItem }) {
  return (
    <li>
      <Link
        href={item.href}
        className={
          'flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors ' +
          (item.active
            ? 'bg-accent/15 text-accent-soft border border-accent/30'
            : 'text-text hover:bg-surface-2')
        }
      >
        {item.icon ? (
          <span className="w-4 h-4 shrink-0 flex items-center justify-center text-muted">{item.icon}</span>
        ) : null}
        <span className="truncate">{item.label}</span>
      </Link>
    </li>
  );
}

function MascotQuizCard() {
  return (
    <div className="p-3 border-t border-border">
      <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-emotion-grief/40 via-accent/30 to-emotion-ambition/30 p-3 border border-accent/30">
        {/* Mascot placeholder: silhouette built from CSS until we ship the real illustration */}
        <div
          className="absolute -top-1 -right-2 w-20 h-24 opacity-70 pointer-events-none"
          aria-hidden
        >
          <svg viewBox="0 0 80 96" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="mascot" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9b85ff" />
                <stop offset="100%" stopColor="#5b3eff" />
              </linearGradient>
            </defs>
            {/* hair */}
            <path d="M30 18 Q20 30 24 50 L18 70 L24 80 L30 70 Q26 50 38 36 Q50 26 56 36 Q60 50 56 70 L62 80 L66 70 L60 50 Q66 30 54 18 Q42 8 30 18Z" fill="url(#mascot)" />
            {/* face */}
            <ellipse cx="40" cy="42" rx="16" ry="18" fill="#f1d6c0" opacity="0.9" />
            {/* eyes */}
            <ellipse cx="34" cy="42" rx="2" ry="3" fill="#1a1a1f" />
            <ellipse cx="46" cy="42" rx="2" ry="3" fill="#1a1a1f" />
          </svg>
        </div>
        <div className="relative">
          <div className="text-sm font-semibold mb-1 pr-12">Take the Anime Emotional Quiz</div>
          <p className="text-xs text-muted mb-2.5 pr-10 leading-snug">
            Discover anime that truly understand you.
          </p>
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent-soft transition-colors"
          >
            Start Quiz
          </Link>
        </div>
      </div>
    </div>
  );
}

function RightRailColumn({ children }: { children: ReactNode }) {
  return (
    <aside className="w-right-rail bg-surface border-l border-border flex-shrink-0 hidden xl:flex flex-col h-[calc(100vh-theme(height.topbar))] sticky top-topbar overflow-y-auto p-4 gap-6">
      {children}
    </aside>
  );
}

/* ============================ Right-rail widgets ============================ */

export function RightRailEmotionalProfile() {
  return (
    <section className="rounded-lg border border-border bg-surface-2 p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-semibold">Your Emotional Profile</h3>
      </div>
      <div className="flex justify-center mb-3">
        <Hex
          size={200}
          axes={[
            { label: 'Reflective', value: 0.74 },
            { label: 'Emotional', value: 0.81 },
            { label: 'Dark', value: 0.42 },
            { label: 'Hopeful', value: 0.68 },
            { label: 'Cloud', value: 0.55 },
            { label: 'Calm', value: 0.7 },
          ]}
        />
      </div>
      <p className="text-xs text-muted leading-relaxed mb-3">
        You connect deeply with emotional and existentially heavy stories.
      </p>
      <Link
        href="/profile"
        className="block w-full text-center text-xs h-8 leading-8 rounded-md bg-surface-3 border border-border hover:border-accent/50 text-text"
      >
        View Full Profile
      </Link>
    </section>
  );
}

export function RightRailCommunityDiscussions() {
  const items = [
    { user: 'KaitoX', q: 'Did Eren really want freedom?', replies: 142 },
    { user: 'mira_', q: 'Why are people 25 hr different with Eva?', replies: 87 },
    { user: 'shiro', q: 'Anime that changed your life forever?', replies: 311 },
    { user: 'arashi', q: 'Most misunderstood anime ending?', replies: 56 },
  ];
  return (
    <section className="rounded-lg border border-border bg-surface-2 p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-semibold">Community Discussions</h3>
        <Link href="/community" className="text-xs text-muted hover:text-accent">
          View all
        </Link>
      </div>
      <ul className="space-y-2.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2.5">
            <Avatar name={it.user} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium leading-tight truncate">{it.q}</div>
              <div className="text-xs text-muted mt-0.5">
                {it.replies} replies · {it.user}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RightRailTrendingThisWeek() {
  const items = [
    { rank: 1, name: 'Solo Leveling', score: 9.12 },
    { rank: 2, name: 'Oshi no Ko', score: 9.01 },
    { rank: 3, name: 'Jujutsu Kaisen S2', score: 8.91 },
    { rank: 4, name: "Frieren: Beyond Journey's End", score: 9.28 },
    { rank: 5, name: 'Chainsaw Man', score: 8.62 },
  ];
  return (
    <section className="rounded-lg border border-border bg-surface-2 p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-semibold">Trending This Week</h3>
        <Link href="/discover?sort=trending" className="text-xs text-muted hover:text-accent">
          View all
        </Link>
      </div>
      <ol className="space-y-2.5">
        {items.map((it) => (
          <li key={it.rank} className="flex items-center gap-2.5">
            <span className="w-5 text-center text-xs font-mono text-muted tabular-nums">{it.rank}</span>
            <div className="w-9 h-9 rounded-md bg-surface-3 border border-border flex-shrink-0" aria-hidden />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{it.name}</div>
              <div className="text-xs text-muted">★ {it.score.toFixed(2)}</div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
