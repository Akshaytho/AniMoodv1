import { Stub } from '@/components/Stub';
import { resolveEmotion, humanize } from '@/lib/seed-lookup';

export default async function EmotionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = resolveEmotion(slug) ?? humanize(slug);
  return (
    <Stub
      title={name}
      description={`Every title and character in AniMood that resonates with "${name.toLowerCase()}" — with intensity, evidence notes, and softer or sharper alternatives.`}
      upcomingIn="commit 14"
      currentPath="/discover"
    />
  );
}
