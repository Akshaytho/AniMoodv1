import { Stub } from '@/components/Stub';
import { humanize } from '@/lib/seed-lookup';

export default async function MangaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Stub
      title={humanize(slug)}
      description="Full manga page — same emotional discovery model as anime, with manga-specific demographics and serialization status."
      upcomingIn="commit 18"
      currentPath="/manga"
    />
  );
}
