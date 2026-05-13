import { apiGet } from '@/lib/api';

interface HealthBudget { used: number; cap: number; remaining: number }
interface Health {
  status: string;
  db: string;
  budget: HealthBudget | null;
}
interface MappingsStats { stats: Record<string, number> }

export default async function Overview() {
  const [health, mapStats] = await Promise.all([
    apiGet<Health>('/health'),
    apiGet<MappingsStats>('/mappings/stats').catch(() => ({ stats: {} })),
  ]);

  const stats: Record<string, number> = mapStats.stats;
  const pending = (stats['evidence_collected'] ?? 0) + (stats['proposed'] ?? 0);
  const reviewed = stats['human_reviewed'] ?? 0;
  const published = stats['published'] ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Overview</h1>

      <section>
        <h2 className="text-sm uppercase tracking-wider text-muted mb-3">Mapping queue</h2>
        <div className="grid grid-cols-3 gap-3 max-w-2xl">
          <Stat label="Pending review" value={pending} highlight />
          <Stat label="Reviewed" value={reviewed} />
          <Stat label="Published" value={published} />
        </div>
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wider text-muted mb-3">System</h2>
        <div className="grid grid-cols-3 gap-3 max-w-2xl">
          <Stat label="DB" value={health.db === 'reachable' ? 'OK' : health.db} />
          <Stat
            label="OpenAI tokens used"
            value={health.budget ? `${health.budget.used.toLocaleString()} / ${health.budget.cap.toLocaleString()}` : '—'}
          />
          <Stat
            label="Tokens remaining"
            value={health.budget ? health.budget.remaining.toLocaleString() : '—'}
          />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`bg-surface border ${highlight ? 'border-accent' : 'border-border'} rounded-md p-4`}>
      <div className="text-xs text-muted uppercase tracking-wider">{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  );
}
