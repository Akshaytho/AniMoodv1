'use client';

import { useCallback, useEffect, useState } from 'react';

export interface MappingRow {
  id: number;
  type: string;
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
}

type Decision = 'approved' | 'rejected';

export function MappingsQueue({ initial }: { initial: MappingRow[] }) {
  const [items, setItems] = useState<MappingRow[]>(initial);
  const [cursor, setCursor] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ id: number; decision: Decision }>>([]);

  const current = items[cursor] ?? null;

  const move = useCallback((delta: number) => {
    setCursor((c) => Math.min(Math.max(c + delta, 0), Math.max(items.length - 1, 0)));
  }, [items.length]);

  const decide = useCallback(async (decision: Decision) => {
    if (!current || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/mappings/${current.id}/${decision === 'approved' ? 'approve' : 'reject'}`, {
        method: 'POST',
      });
      if (!res.ok) {
        setError(`Decision failed (${res.status})`);
        return;
      }
      setHistory((h) => [...h, { id: current.id, decision }]);
      setItems((arr) => arr.filter((m) => m.id !== current.id));
      setCursor((c) => Math.max(0, Math.min(c, items.length - 2)));
    } catch {
      setError('Network error — is the API server up?');
    } finally {
      setBusy(false);
    }
  }, [current, busy, items.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'a' || e.key === 'A') { e.preventDefault(); void decide('approved'); }
      else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); void decide('rejected'); }
      else if (e.key === 'j' || e.key === 'J') { e.preventDefault(); move(1); }
      else if (e.key === 'k' || e.key === 'K') { e.preventDefault(); move(-1); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [decide, move]);

  if (items.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-md p-8 text-center text-muted">
        Nothing in the queue. {history.length > 0 && `(${history.length} decided this session.)`}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[1fr_240px] gap-4">
      <article className="bg-surface border border-border rounded-md p-5">
        {current ? (
          <>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-xl font-semibold">{current.sourceName ?? `(source ${current.type})`}</h2>
              <span className="text-xs text-muted">
                #{current.id} · {cursor + 1} / {items.length}
              </span>
            </div>
            <div className="flex gap-2 text-xs mb-4">
              <Tag label={`type · ${current.type}`} />
              <Tag label={`target · ${current.targetTable}#${current.targetId}`} />
              {current.intensity != null && <Tag label={`intensity · ${current.intensity}`} />}
              <Tag label={`confidence · ${current.confidence}`} />
              {current.confidenceScore && <Tag label={`score · ${current.confidenceScore}`} />}
              <Tag label={`evidence · ${current.evidenceCount}`} />
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{current.evidenceNotes}</p>
          </>
        ) : (
          <div className="text-muted">No mapping selected.</div>
        )}
      </article>
      <aside className="bg-surface border border-border rounded-md p-4 space-y-2">
        <button
          onClick={() => void decide('approved')}
          disabled={busy || !current}
          className="w-full py-2.5 bg-success/15 border border-success/40 hover:bg-success/25 disabled:opacity-50 rounded-md text-sm font-medium text-success"
        >
          Approve <kbd className="kbd ml-1">A</kbd>
        </button>
        <button
          onClick={() => void decide('rejected')}
          disabled={busy || !current}
          className="w-full py-2.5 bg-danger/15 border border-danger/40 hover:bg-danger/25 disabled:opacity-50 rounded-md text-sm font-medium text-danger"
        >
          Reject <kbd className="kbd ml-1">R</kbd>
        </button>
        <button
          onClick={() => move(1)}
          className="w-full py-2 bg-bg border border-border hover:bg-border/50 rounded-md text-xs"
        >
          Skip <kbd className="kbd ml-1">J</kbd>
        </button>
        {error && <p className="text-xs text-danger mt-2">{error}</p>}
        <div className="text-xs text-muted mt-4 pt-3 border-t border-border">
          Decided this session: <strong className="text-text">{history.length}</strong>
        </div>
      </aside>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="px-2 py-0.5 bg-bg border border-border rounded text-muted">{label}</span>
  );
}
