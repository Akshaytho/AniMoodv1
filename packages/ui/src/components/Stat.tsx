import { type ReactNode } from 'react';
import { cx } from '../lib/cx';

interface StatProps {
  label: string;
  value: ReactNode;
  hint?: string;
  highlight?: boolean;
  className?: string;
}

export function Stat({ label, value, hint, highlight, className }: StatProps) {
  return (
    <div
      className={cx(
        'rounded-lg p-4 border',
        highlight ? 'border-accent/50 bg-surface' : 'border-border bg-surface',
        className,
      )}
    >
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
      {hint && <div className="text-xs text-faint mt-1">{hint}</div>}
    </div>
  );
}
