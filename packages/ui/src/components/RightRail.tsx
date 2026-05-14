import { type ReactNode } from 'react';

interface RightRailProps {
  children: ReactNode;
}

export function RightRail({ children }: RightRailProps) {
  return (
    <aside className="w-right-rail bg-surface border-l border-border flex-shrink-0 h-screen sticky top-0 overflow-y-auto p-4 space-y-6">
      {children}
    </aside>
  );
}
