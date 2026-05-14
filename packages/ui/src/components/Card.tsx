import { type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../lib/cx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'accent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'bg-surface border border-border',
  glass: 'bg-surface/70 backdrop-blur-md border border-border',
  accent: 'bg-surface border border-accent/40 shadow-accentGlow',
};

export function Card({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cx(
        'rounded-lg shadow-card',
        variantClasses[variant],
        paddingClasses[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
