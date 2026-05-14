import { cx } from '@animood/ui';

interface ImpactRow {
  name: string;
  intensity: number | null;
  confidence: string;
  /** Tailwind color key from packages/config emotion palette. */
  colorKey?: string;
}

interface EmotionImpactBarsProps {
  rows: ImpactRow[];
}

/**
 * Right-rail / inline emotional-impact widget. Bar length is intensity (1-5)
 * normalized to 100%. Color comes from the emotion palette.
 */
export function EmotionImpactBars({ rows }: EmotionImpactBarsProps) {
  if (rows.length === 0) {
    return (
      <p className="text-[12px] text-muted">No emotional mappings yet for this title.</p>
    );
  }
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => {
        const pct = Math.round(((r.intensity ?? 0) / 5) * 100);
        const colorClass = r.colorKey
          ? `bg-emotion-${r.colorKey}`
          : 'bg-accent';
        return (
          <li key={r.name}>
            <div className="flex items-baseline justify-between mb-1 text-[12px]">
              <span className="text-text">{r.name}</span>
              <span className="text-muted tabular-nums">
                {r.intensity ?? '—'}/5 · {r.confidence}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-pill bg-surface-2 overflow-hidden">
              <div
                className={cx('h-full rounded-pill transition-all duration-500', colorClass)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
