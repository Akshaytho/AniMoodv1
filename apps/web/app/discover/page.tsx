import { Stub } from '@/components/Stub';

interface SP { mood?: string; q?: string }

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const meta: Array<{ label: string; value: string }> = [];
  if (sp.q) meta.push({ label: 'Search', value: `"${sp.q}"` });
  if (sp.mood) meta.push({ label: 'Mood filter', value: sp.mood });

  const props = {
    title: 'Discover by Emotion',
    description:
      'Filter 30+ titles by emotional theme, intensity, and life-stage. Pick a mood, get a curated list with the why behind each match.',
    upcomingIn: 'commit 15',
    currentPath: '/discover',
    ...(meta.length > 0 ? { resolvedMeta: meta } : {}),
  };
  return <Stub {...props} />;
}
