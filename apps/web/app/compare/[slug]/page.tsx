import { Stub } from '@/components/Stub';
import { humanize } from '@/lib/seed-lookup';

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Stub
      title={`Compare: ${humanize(slug)}`}
      description="Side-by-side emotional comparison of two titles — pacing, intensity, themes, recovery arc — to help you pick the right one for the mood."
      upcomingIn="Phase 4 (post-launch)"
      currentPath="/opinions"
    />
  );
}
