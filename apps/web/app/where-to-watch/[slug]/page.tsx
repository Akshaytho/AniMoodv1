import { Stub } from '@/components/Stub';
import { humanize } from '@/lib/seed-lookup';

export default async function WhereToWatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Stub
      title={`Where to watch ${humanize(slug)}`}
      description="Official sources only — Crunchyroll, Netflix, Hidive, and regional licensors. We never embed or host streams."
      upcomingIn="commit 18"
      currentPath="/anime"
    />
  );
}
