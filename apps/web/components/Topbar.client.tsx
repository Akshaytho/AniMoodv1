'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Avatar } from '@animood/ui';
import { IconBell } from '@/lib/icons';

export function Topbar() {
  const [q, setQ] = useState('');
  const router = useRouter();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/discover');
  }

  return (
    <header className="h-topbar bg-bg/70 backdrop-blur-xl border-b border-border sticky top-0 z-10 flex items-center pl-16 md:pl-5 lg:pl-8 pr-5 lg:pr-8 gap-4">
      <form onSubmit={onSubmit} className="flex-1 max-w-2xl">
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
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full h-10 pl-10 pr-3 bg-surface-2/70 border border-border rounded-full text-[13px] placeholder:text-faint focus:outline-none focus:border-accent/50 focus:bg-surface-2"
          />
        </div>
      </form>
      <div className="flex-1 hidden md:block" />
      <button
        type="button"
        aria-label="Notifications — not yet wired"
        aria-disabled
        title="Notifications arrive in Phase 4"
        className="relative w-9 h-9 rounded-full bg-surface-2 border border-border text-muted cursor-not-allowed opacity-70 inline-flex items-center justify-center"
      >
        <IconBell width={16} height={16} />
      </button>
      <div
        className="flex items-center gap-2.5"
        aria-label="Signed-in user (account menu in Phase 4)"
        title="Account menu arrives in Phase 4"
      >
        <span className="text-sm font-medium hidden sm:inline">Harish</span>
        <Avatar name="Harish" size="sm" ring />
      </div>
    </header>
  );
}
