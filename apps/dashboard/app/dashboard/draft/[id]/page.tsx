import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiGet, type ApiError } from '@/lib/api';
import { DraftActions } from './draft-actions';

interface Draft {
  id: number;
  pageType: string;
  entitySlug: string;
  title: string;
  markdown: string;
  schemaJsonld: Record<string, unknown>;
  internalLinks: Array<{ kind: string; slug: string; anchor: string }>;
  status: string;
  reviewFlags: string[];
  wordCount: string | null;
  createdAt: string;
}

export default async function DraftPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let draft: Draft;
  try {
    draft = await apiGet<Draft>(`/drafts/${id}`);
  } catch (err) {
    if ((err as ApiError).status === 404) notFound();
    throw err;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href="/dashboard/drafts" className="text-sm text-muted hover:text-text">
          ← Back to drafts
        </Link>
      </div>

      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{draft.title}</h1>
          <div className="text-sm text-muted mt-1">/{draft.pageType}/{draft.entitySlug}</div>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-0.5 bg-surface border border-border rounded">{draft.status}</span>
          {draft.wordCount && (
            <span className="px-2 py-0.5 bg-surface border border-border rounded">{draft.wordCount} words</span>
          )}
        </div>
      </header>

      {draft.reviewFlags.length > 0 && (
        <div className="bg-danger/10 border border-danger/40 rounded-md p-3 text-sm text-danger">
          <strong>Flagged by auto-audit:</strong> {draft.reviewFlags.join(', ')}
        </div>
      )}

      <section>
        <h2 className="text-sm uppercase tracking-wider text-muted mb-3">Markdown</h2>
        <pre className="bg-surface border border-border rounded-md p-4 text-sm leading-relaxed whitespace-pre-wrap font-sans">
          {draft.markdown}
        </pre>
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wider text-muted mb-3">
          Internal links ({draft.internalLinks.length})
        </h2>
        {draft.internalLinks.length === 0 ? (
          <p className="text-sm text-muted">None.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {draft.internalLinks.map((l, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-xs px-2 py-0.5 bg-surface border border-border rounded text-muted">
                  {l.kind}
                </span>
                <span className="text-muted">{l.anchor}</span>
                <span className="text-muted">→</span>
                <span>/{l.kind}/{l.slug}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wider text-muted mb-3">schema.org JSON-LD</h2>
        <pre className="bg-surface border border-border rounded-md p-4 text-xs leading-relaxed overflow-x-auto font-mono">
          {JSON.stringify(draft.schemaJsonld, null, 2)}
        </pre>
      </section>

      <DraftActions id={draft.id} />
    </div>
  );
}
