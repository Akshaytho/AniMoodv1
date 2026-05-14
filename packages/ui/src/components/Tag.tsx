import { type HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

/**
 * Emotion tag chip. `colorKey` maps to an emotion-* class; if absent, falls
 * back to neutral. See packages/config/src/tokens.ts emotion palette.
 */
interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  colorKey?: string;
  intensity?: number | null;
}

export function Tag({ colorKey, intensity, className, children, ...rest }: TagProps) {
  const colorClass = colorKey
    ? `text-emotion-${colorKey} border-emotion-${colorKey}/40 bg-emotion-${colorKey}/10`
    : 'text-muted border-border bg-surface-2';
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-pill text-xs font-medium border',
        colorClass,
        className,
      )}
      {...rest}
    >
      {children}
      {intensity != null && (
        <span className="opacity-70 font-normal tabular-nums">{intensity}</span>
      )}
    </span>
  );
}
