import { Stub } from '@/components/Stub';
import { humanize } from '@/lib/seed-lookup';

export default async function CharacterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Stub
      title={humanize(slug)}
      description="Character profile with psychological archetype, arc summary, key moments, similar characters, and why people connect with them."
      upcomingIn="commit 18"
      currentPath="/characters"
    />
  );
}
