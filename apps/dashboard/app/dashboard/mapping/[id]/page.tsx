import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiGet, type ApiError } from '@/lib/api';
import { DecideButtons } from './decide-buttons';

interface SignalRow {
  id: number;
  sourceType: string;
  sourceUrl: string | null;
  extractedPattern: string;
  intensityHint: number | null;
  confidenceScore: number | null;
  createdAt: string;
}

interface MappingDetail {
  id: number;
  type: string;
  sourceTable: string;
  sourceId: number;
  sourceName: string | null;
  sourceSlug: string | null;
  targetTable: string;
  targetId: number;
  intensity: number | null;
  evidenceNotes: string;
  evidenceCount: number;
  confidence: string;
  confidenceScore: string | null;
  status: string;
  createdAt: string;
  signals: SignalRow[];
}

export default async function MappingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let detail: MappingDetail;
  try {
    detail = await apiGet<MappingDetail>(`/mappings/${id}`);
  } catch (err) {
    if ((err as ApiError).status === 404) notFound();
    throw err;
  }

  const sourceBreakdown = detail.signals.reduce<Record<string, number>>((acc, s) => {
    acc[s.sourceType] = (acc[s.sourceType] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href="/dashboard/mappings" className="text-sm text-muted hover:text-text">
          ← Back to queue
        </Link>
      </div>

      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">
          {detail.sourceName ?? `(source ${detail.type})`}
        </h1>
        <span className="text-sm text-muted">#{detail.id} · {detail.status}</span>
      </header>

      <section className="bg-surface border border-border rounded-md p-5 space-y-4">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Field label="Type" value={detail.type} />
          <Field label="Target" value={`${detail.targetTable}#${detail.targetId}`} />
          <Field label="Intensity" value={detail.intensity ?? '—'} />
          <Field label="Confidence" value={`${detail.confidence}${detail.confidenceScore ? ` (${detail.confidenceScore})` : ''}`} />
          <Field label="Evidence count" value={detail.evidenceCount} />
          <Field label="Created" value={new Date(detail.createdAt).toLocaleString()} />
        </dl>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted mb-1.5">Evidence notes</div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{detail.evidenceNotes}</p>
        </div>
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wider text-muted mb-3">
          Signals ({detail.signals.length}) — source breakdown
        </h2>
        <div className="flex gap-3 text-xs mb-3">
          {Object.entries(sourceBreakdown).map(([src, n]) => (
            <span key={src} className="px-2 py-0.5 bg-surface border border-border rounded text-muted">
              {src} · {n}
            </span>
          ))}
        </div>
        <ul className="space-y-2">
          {detail.signals.length === 0 && (
            <li className="text-sm text-muted">No signals attached to this mapping yet (seed data).</li>
          )}
          {detail.signals.map((s) => (
            <li key={s.id} className="bg-surface border border-border rounded-md p-3 text-sm">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs uppercase tracking-wider text-muted">{s.sourceType}</span>
                {s.sourceUrl && (
                  <a href={s.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">
                    source ↗
                  </a>
                )}
              </div>
              <p className="leading-relaxed">{s.extractedPattern}</p>
            </li>
          ))}
        </ul>
      </section>

      <DecideButtons id={detail.id} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xs text-muted uppercase tracking-wider">{label}</div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}
