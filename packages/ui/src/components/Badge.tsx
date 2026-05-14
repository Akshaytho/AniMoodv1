import { type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../lib/cx';

export type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-2 text-muted border-border',
  accent: 'bg-accent/15 text-accent-soft border-accent/40',
  success: 'bg-success-soft text-success border-success/40',
  warning: 'bg-warning-soft text-warning border-warning/40',
  danger: 'bg-danger-soft text-danger border-danger/40',
};

export function Badge({ variant = 'default', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border',
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
