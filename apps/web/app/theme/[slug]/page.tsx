import { Stub } from '@/components/Stub';
import { humanize } from '@/lib/seed-lookup';

export default async function ThemePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Stub
      title={humanize(slug)}
      description="Narrative theme exploration — titles that engage this idea seriously, plus the emotional shapes they take."
      upcomingIn="commit 18"
      currentPath="/discover"
    />
  );
}
