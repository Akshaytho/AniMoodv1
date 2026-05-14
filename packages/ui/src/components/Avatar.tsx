import { type HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | undefined;
  alt?: string | undefined;
  name?: string | undefined;
  size?: 'sm' | 'md' | 'lg' | undefined;
  ring?: boolean | undefined;
}

const sizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-md',
};

function initials(name?: string): string {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  ring = false,
  className,
  ...rest
}: AvatarProps) {
  return (
    <div
      className={cx(
        'rounded-pill bg-surface-2 inline-flex items-center justify-center font-medium text-muted overflow-hidden flex-shrink-0',
        ring && 'ring-2 ring-accent/40 ring-offset-2 ring-offset-bg',
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt ?? name ?? ''} className="w-full h-full object-cover" />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}
