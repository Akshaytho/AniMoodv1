import { type ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface SidebarItem {
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
}

interface SidebarProps {
  brand: ReactNode;
  sections: Array<{
    title?: string;
    items: SidebarItem[];
  }>;
  footer?: ReactNode;
  /** `apps/web` passes Next's <Link>, tests pass plain <a>. */
  linkAs?: 'a' | React.ElementType;
}

export function Sidebar({ brand, sections, footer, linkAs: LinkAs = 'a' }: SidebarProps) {
  return (
    <aside className="w-sidebar bg-surface border-r border-border flex flex-col flex-shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div className="p-4 border-b border-border">{brand}</div>

      <nav className="flex-1 p-2 space-y-4 text-sm">
        {sections.map((section, si) => (
          <div key={si}>
            {section.title && (
              <div className="px-3 mb-1 text-xs uppercase tracking-wider text-faint">
                {section.title}
              </div>
            )}
            <ul className="space-y-0.5">
              {section.items.map((it) => (
                <li key={it.href}>
                  <LinkAs
                    href={it.href}
                    className={cx(
                      'flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors',
                      it.active
                        ? 'bg-accent/15 text-accent-soft border border-accent/30'
                        : 'text-text hover:bg-surface-2',
                    )}
                  >
                    {it.icon && <span className="w-4 h-4 shrink-0 flex items-center justify-center text-muted">{it.icon}</span>}
                    <span className="truncate">{it.label}</span>
                  </LinkAs>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {footer && <div className="p-3 border-t border-border">{footer}</div>}
    </aside>
  );
}
