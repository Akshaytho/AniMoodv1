'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DraftActions({ id }: { id: number }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const router = useRouter();

  async function decide(action: 'approve' | 'reject') {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/drafts/${id}/${action}`, { method: 'POST' });
      if (!res.ok) {
        setError(`Decision failed (${res.status})`);
        return;
      }
      if (action === 'approve') {
        const body = (await res.json()) as { publishedSlug?: string };
        setPublishedSlug(body.publishedSlug ?? null);
        router.refresh();
      } else {
        router.push('/dashboard/drafts');
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-md p-4 flex items-center gap-3">
      <button
        onClick={() => void decide('approve')}
        disabled={busy}
        className="px-4 py-2 bg-success/15 border border-success/40 hover:bg-success/25 disabled:opacity-50 rounded-md text-sm font-medium text-success"
      >
        Approve & publish
      </button>
      <button
        onClick={() => void decide('reject')}
        disabled={busy}
        className="px-4 py-2 bg-danger/15 border border-danger/40 hover:bg-danger/25 disabled:opacity-50 rounded-md text-sm font-medium text-danger"
      >
        Reject
      </button>
      {publishedSlug && (
        <span className="text-sm text-success ml-2">
          Published as /{publishedSlug}
        </span>
      )}
      {error && <span className="text-sm text-danger ml-2">{error}</span>}
    </div>
  );
}
