import Link from 'next/link';
import { AppShell } from './AppShell';

export interface StubProps {
  /** Display title for the route, e.g. "Vinland Saga" or "Discover by Emotion". */
  title: string;
  /** Short one-line description of what this page WILL be. */
  description: string;
  /** Phase / commit number where this lands for real. */
  upcomingIn: string;
  /** The slug/route this stub stands in for — used for sidebar active-state highlighting. */
  currentPath: string;
  /** Optional resolved metadata when we DO have seed data (e.g. anime title, emotion definition). */
  resolvedMeta?: Array<{ label: string; value: string }>;
}

/**
 * Reusable placeholder for routes not yet built. Honest about what it is and
 * what's coming, instead of a raw 404 or an empty page.
 */
export function Stub(props: StubProps) {
  return (
    <AppShell currentPath={props.currentPath}>
      <div className="max-w-2xl mx-auto pt-8 md:pt-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-surface-2 border border-border text-[11px] uppercase tracking-[0.12em] text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" aria-hidden />
          Building this — {props.upcomingIn}
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-semibold mt-5 text-balance">
          {props.title}
        </h1>
        <p className="text-muted mt-3 max-w-md mx-auto text-md leading-relaxed">
          {props.description}
        </p>

        {props.resolvedMeta && props.resolvedMeta.length > 0 && (
          <dl className="mt-7 inline-grid grid-cols-2 gap-x-6 gap-y-2 text-left text-sm bg-surface/60 border border-border rounded-xl px-5 py-4">
            {props.resolvedMeta.map((m) => (
              <div key={m.label} className="contents">
                <dt className="text-muted">{m.label}</dt>
                <dd className="text-text font-medium tabular-nums">{m.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-8 flex gap-3 justify-center flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-surface-2 border border-border hover:border-accent/40 text-sm"
          >
            ← Back home
          </Link>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-soft transition-colors"
          >
            Explore what works
          </Link>
        </div>

        <p className="text-faint text-xs mt-12 leading-relaxed">
          AniMood is being built in public, page by page. Real fan-discussion ingestion (AniList + MAL forums)
          and AI-extracted emotional mappings — backed by human review — feed every page once live.
        </p>
      </div>
    </AppShell>
  );
}
