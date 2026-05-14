import Link from 'next/link';
import { Sidebar, Topbar, type SidebarItem } from '@animood/ui';
import { NAV_SECTIONS, MOOD_PILLS } from '@/lib/nav';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const brand = (
    <Link href="/" className="flex items-baseline gap-1 group">
      <span className="text-xl font-display font-semibold tracking-tight">
        emo<span className="text-accent">°</span>nime
      </span>
    </Link>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar
        brand={brand}
        linkAs={Link as unknown as 'a'}
        sections={NAV_SECTIONS as Array<{ title?: string; items: SidebarItem[] }>}
        footer={
          <div className="rounded-md bg-gradient-to-br from-accent/30 to-accent/5 p-3 border border-accent/30">
            <div className="text-sm font-semibold mb-1">Take the Emotional Quiz</div>
            <p className="text-xs text-muted mb-2">Find anime that match what you actually feel.</p>
            <Link
              href="/quiz"
              className="inline-flex items-center justify-center w-full h-8 px-3 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent-soft transition-colors"
            >
              Start quiz
            </Link>
          </div>
        }
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar userName="Guest" />
        <main className="flex-1 p-6 overflow-x-hidden">
          <div className="max-w-content mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

// Re-export for sub-pages that want the mood pill list
export { MOOD_PILLS };
