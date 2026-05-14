import { Stub } from '@/components/Stub';
import { humanize } from '@/lib/seed-lookup';

export default async function DebatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Stub
      title={`Debate: ${humanize(slug)}`}
      description="Opinion-spectrum page — every angle on the title, paraphrased from real fan discussion with confidence and evidence."
      upcomingIn="Phase 4 (post-launch)"
      currentPath="/opinions"
    />
  );
}
