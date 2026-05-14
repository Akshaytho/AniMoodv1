import { redirect } from 'next/navigation';

/** Search currently just funnels into Discover with the same query. */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  redirect(sp.q ? `/discover?q=${encodeURIComponent(sp.q)}` : '/discover');
}
