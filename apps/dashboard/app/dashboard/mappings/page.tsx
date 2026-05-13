import { apiGet } from '@/lib/api';
import { MappingsQueue, type MappingRow } from './queue';

interface MappingsListResponse {
  total: number;
  limit: number;
  offset: number;
  items: MappingRow[];
}

export default async function MappingsPage() {
  const data = await apiGet<MappingsListResponse>(
    '/mappings?status=evidence_collected&limit=50',
  );
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Mappings review queue</h1>
        <div className="text-sm text-muted">{data.total} pending</div>
      </div>
      <p className="text-sm text-muted">
        Shortcuts: <kbd className="kbd">A</kbd> approve · <kbd className="kbd">R</kbd> reject ·{' '}
        <kbd className="kbd">J</kbd>/<kbd className="kbd">K</kbd> next/prev
      </p>
      <MappingsQueue initial={data.items} />
    </div>
  );
}
