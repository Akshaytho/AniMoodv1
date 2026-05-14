import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-md',
};

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-soft active:bg-accent-deep shadow-accentGlow disabled:bg-accent/40 disabled:shadow-none',
  secondary:
    'bg-surface-2 text-text border border-border hover:bg-surface-3 hover:border-border-strong',
  ghost: 'bg-transparent text-text hover:bg-surface-2',
  danger:
    'bg-danger-soft text-danger border border-danger/40 hover:bg-danger/25',
  success:
    'bg-success-soft text-success border border-success/40 hover:bg-success/25',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', leftIcon, rightIcon, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        'disabled:cursor-not-allowed disabled:opacity-60',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
});
