import { type ReactNode } from 'react';
import { Avatar } from './Avatar';

interface TopbarProps {
  searchPlaceholder?: string;
  rightSlot?: ReactNode;
  userName?: string;
  userAvatarSrc?: string;
}

export function Topbar({
  searchPlaceholder = 'Search anime, manga, themes, emotions…',
  rightSlot,
  userName,
  userAvatarSrc,
}: TopbarProps) {
  return (
    <header className="h-topbar border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-10 flex items-center px-6 gap-4">
      <div className="flex-1 max-w-xl">
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
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder={searchPlaceholder}
            className="w-full h-9 pl-9 pr-3 bg-surface-2 border border-border rounded-md text-sm placeholder:text-faint focus:outline-none focus:border-accent/60"
          />
        </div>
      </div>
      {rightSlot}
      <Avatar name={userName} src={userAvatarSrc} size="sm" ring />
    </header>
  );
}
