'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DecideButtons({ id }: { id: number }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function decide(action: 'approve' | 'reject') {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/mappings/${id}/${action}`, { method: 'POST' });
      if (!res.ok) {
        setError(`Decision failed (${res.status})`);
        return;
      }
      router.push('/dashboard/mappings');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={() => void decide('approve')}
        disabled={busy}
        className="px-4 py-2 bg-success/15 border border-success/40 hover:bg-success/25 disabled:opacity-50 rounded-md text-sm font-medium text-success"
      >
        Approve
      </button>
      <button
        onClick={() => void decide('reject')}
        disabled={busy}
        className="px-4 py-2 bg-danger/15 border border-danger/40 hover:bg-danger/25 disabled:opacity-50 rounded-md text-sm font-medium text-danger"
      >
        Reject
      </button>
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}
