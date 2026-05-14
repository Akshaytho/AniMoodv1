import { type ReactNode } from 'react';
import { Tag } from './Tag';
import { cx } from '../lib/cx';

export interface PosterCardProps {
  /** Renders the image. `apps/web` passes Next's `<Image>`; tests pass a plain img. */
  image: ReactNode;
  href?: string;
  title: string;
  meta?: string;
  score?: number;
  tags?: Array<{ slug: string; name: string; colorKey?: string }>;
  className?: string;
}

/**
 * Card used for the recommended/trending rows. Image is injected so this
 * stays framework-agnostic — `apps/web` uses Next's `<Image>` for optimization;
 * tests render a plain `<img>`.
 */
export function PosterCard({ image, href, title, meta, score, tags, className }: PosterCardProps) {
  const inner = (
    <article
      className={cx(
        'group flex flex-col rounded-lg overflow-hidden bg-surface border border-border',
        'transition-all duration-200 hover:border-accent/60 hover:shadow-accentGlow hover:-translate-y-0.5',
        className,
      )}
    >
      <div className="aspect-[3/4] bg-surface-2 relative overflow-hidden">
        {image}
        {score != null && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-bg/80 backdrop-blur text-xs flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#ffb547">
              <path d="M12 2l2.9 6.4 7.1.6-5.4 4.7 1.7 6.9L12 17l-6.3 3.6 1.7-6.9L2 9l7.1-.6L12 2z" />
            </svg>
            <span className="tabular-nums font-medium">{score.toFixed(2)}</span>
          </div>
        )}
      </div>
      <div className="p-2.5 space-y-1.5">
        <h3 className="text-sm font-semibold leading-tight truncate" title={title}>{title}</h3>
        {meta && <p className="text-xs text-muted truncate">{meta}</p>}
        {tags && tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {tags.slice(0, 3).map((t) => (
              <Tag key={t.slug} colorKey={t.colorKey ?? t.slug}>{t.name}</Tag>
            ))}
          </div>
        )}
      </div>
    </article>
  );
  return href ? <a href={href} className="block">{inner}</a> : inner;
}
