import { ReactNode } from 'react';
import { AppShell } from '@/components/AppShell';

/**
 * Marketing/discovery layout. Individual pages opt into the right rail by
 * exporting a `RightRail` from their module — the layout reads it from the
 * page (it's just a server component). For pages that don't pass a right
 * rail, the column is omitted.
 *
 * For now, we keep this layout simple: the homepage and discover pages will
 * render their own AppShell with their own right rail prop, so this layout
 * is just a pass-through.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export {};
