'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { NAV_SECTIONS, MOOD_PILLS, type NavItem } from '@/lib/nav';

export function SidebarColumn({ currentPath }: { currentPath: string }) {
  const [open, setOpen] = useState(false);

  // Close drawer on route change (path prop is fresh each render via server component refresh,
  // so listening to popstate covers in-app back nav too)
  useEffect(() => {
    setOpen(false);
  }, [currentPath]);

  // Body scroll lock when drawer open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [open]);

  return (
    <>
      {/* Mobile hamburger — visible below md: */}
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="md:hidden fixed top-3 left-3 z-30 w-10 h-10 rounded-md bg-surface/90 border border-border backdrop-blur-md flex items-center justify-center text-text"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        )}
      </button>

      {/* Backdrop — only on mobile when drawer open */}
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 z-20 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Sidebar — drawer on mobile, sticky column on desktop */}
      <aside
        className={
          'fixed md:sticky inset-y-0 left-0 z-20 w-sidebar bg-surface/95 backdrop-blur-md border-r border-border ' +
          'flex flex-col flex-shrink-0 md:h-screen md:top-0 overflow-y-auto scroll-hide transition-transform duration-200 ' +
          (open ? 'translate-x-0 shadow-popover' : '-translate-x-full md:translate-x-0')
        }
      >
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
    </>
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
