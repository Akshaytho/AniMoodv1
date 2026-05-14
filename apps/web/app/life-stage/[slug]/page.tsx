import { Stub } from '@/components/Stub';
import { resolveLifeStage, humanize } from '@/lib/seed-lookup';

export default async function LifeStagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = resolveLifeStage(slug) ?? humanize(slug);
  return (
    <Stub
      title={name}
      description="Stories that meet you where you are in life — careful with sensitive content flags and clearly tagged."
      upcomingIn="commit 18"
      currentPath="/discover"
    />
  );
}
