import { Stub } from '@/components/Stub';
import { resolveAnime, humanize } from '@/lib/seed-lookup';

export default async function AnimePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seed = resolveAnime(slug);
  const title = seed?.name ?? humanize(slug);
  const meta: Array<{ label: string; value: string }> = [];
  if (seed?.meta) meta.push({ label: 'Type', value: seed.meta });
  if (typeof seed?.score === 'number') meta.push({ label: 'MAL score', value: seed.score.toFixed(2) });
  return (
    <Stub
      title={title}
      description="Full title page with emotional positioning, character psychology, similar titles, where-to-watch, and the evidence-backed mappings behind each emotional tag."
      upcomingIn="commit 13"
      currentPath="/anime"
      resolvedMeta={meta}
    />
  );
}
