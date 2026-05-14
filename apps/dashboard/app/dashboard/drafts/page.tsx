import Link from 'next/link';
import { apiGet } from '@/lib/api';

interface DraftListItem {
  id: number;
  pageType: string;
  entitySlug: string;
  title: string;
  status: string;
  wordCount: string | null;
  reviewFlags: string[];
  createdAt: string;
}

interface DraftsResponse {
  items: DraftListItem[];
  limit: number;
  offset: number;
}

export default async function DraftsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const qs = sp.status ? `?status=${encodeURIComponent(sp.status)}` : '';
  const data = await apiGet<DraftsResponse>(`/drafts${qs}`);

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Page drafts</h1>
        <FilterChips active={sp.status} />
      </div>

      {data.items.length === 0 ? (
        <div className="bg-surface border border-border rounded-md p-8 text-center text-muted">
          No drafts. They appear here after W7 (page-draft generation) runs.
        </div>
      ) : (
        <ul className="space-y-2">
          {data.items.map((d) => (
            <li key={d.id}>
              <Link
                href={`/dashboard/draft/${d.id}`}
                className="block bg-surface border border-border rounded-md p-4 hover:border-accent transition-colors"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs uppercase tracking-wider text-muted">
                    {d.pageType} · {d.entitySlug}
                  </span>
                  <StatusBadge status={d.status} />
                </div>
                <div className="font-medium">{d.title}</div>
                {d.reviewFlags.length > 0 && (
                  <div className="text-xs text-danger mt-1">
                    Flags: {d.reviewFlags.join(', ')}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChips({ active }: { active?: string }) {
  const options: Array<{ value?: string; label: string }> = [
    { label: 'All' },
    { value: 'pending_review', label: 'Pending' },
    { value: 'review_passed', label: 'Passed' },
    { value: 'review_flagged', label: 'Flagged' },
    { value: 'approved', label: 'Approved' },
  ];
  return (
    <div className="flex gap-1 text-xs">
      {options.map((o) => (
        <Link
          key={o.label}
          href={o.value ? `/dashboard/drafts?status=${o.value}` : '/dashboard/drafts'}
          className={`px-2.5 py-1 rounded ${
            active === o.value || (!active && !o.value)
              ? 'bg-accent text-white'
              : 'bg-surface border border-border hover:border-muted'
          }`}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    pending_review: 'bg-bg border-border text-muted',
    review_passed: 'bg-success/15 border-success/40 text-success',
    review_flagged: 'bg-danger/15 border-danger/40 text-danger',
    approved: 'bg-accent/15 border-accent/40 text-accent',
    rejected: 'bg-border text-muted',
  };
  return (
    <span className={`text-xs px-2 py-0.5 border rounded ${cls[status] ?? 'bg-bg border-border text-muted'}`}>
      {status}
    </span>
  );
}
