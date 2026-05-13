import Link from 'next/link';
import { redirect } from 'next/navigation';
import { apiGet, type ApiError } from '@/lib/api';

interface Me { email: string; expiresAt: number }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let me: Me;
  try {
    me = await apiGet<Me>('/auth/me');
  } catch (err) {
    const e = err as ApiError;
    if (e.status === 401) redirect('/login');
    throw err;
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r border-border bg-surface flex-shrink-0">
        <div className="p-4 border-b border-border">
          <Link href="/dashboard" className="text-lg font-semibold">AniMood</Link>
          <div className="text-xs text-muted truncate mt-1">{me.email}</div>
        </div>
        <nav className="p-2 text-sm">
          <Link href="/dashboard" className="block px-3 py-2 rounded hover:bg-bg">Overview</Link>
          <Link href="/dashboard/mappings" className="block px-3 py-2 rounded hover:bg-bg">Mappings queue</Link>
          <Link href="/dashboard/drafts" className="block px-3 py-2 rounded hover:bg-bg">Page drafts</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
